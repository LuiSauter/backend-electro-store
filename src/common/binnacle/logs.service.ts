// import { ReportService } from '@/reports/report.service';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  ip: string;
  action: string;
  metadata?: any;
}

interface LogFilter {
  page?: number;
  limit?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly logFileName = 'application-%DATE%.log';
  private winstonLogger: winston.Logger;

  constructor(
    // private readonly reportService: ReportService,
  ) {
    // Asegurar que el directorio de logs exista
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Configurar Winston
    this.winstonLogger = winston.createLogger({
      transports: [
        new winston.transports.DailyRotateFile({
          filename: path.join(this.logDir, this.logFileName),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    });
  }

  /**
   * Registra una acción en la bitácora
   */
  async logAction(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = this.generateUUID();
      const timestamp = new Date().toISOString();

      this.winstonLogger.info('User Action', {
        id,
        timestamp,
        ...entry,
      });
    } catch (error) {
      this.logger.error(`Error al registrar en la bitácora: ${error.message}`, error.stack);
    }
  }

  /**
   * Obtiene los logs según los filtros especificados
   */
  async getLogs(filter: LogFilter): Promise<{ logs: LogEntry[], totalLogs: number }> {
    try {
      const files = this.getLogFiles();
      let logs: LogEntry[] = [];

      // Leer todos los archivos de log
      for (const file of files) {
        const fileContent = fs.readFileSync(path.join(this.logDir, file), 'utf-8');
        const fileLines = fileContent.split('\n').filter(line => line.trim() !== '');

        for (const line of fileLines) {
          try {
            const parsedLine = JSON.parse(line);
            // Verificar si es un registro de acción de usuario
            if (parsedLine.message === 'User Action') {
              const logData = parsedLine;

              logs.push({
                id: logData.id || this.generateUUID(),
                timestamp: logData.timestamp,
                user: logData.user || 'desconocido',
                ip: logData.ip || 'desconocida',
                action: logData.action || 'acción no especificada',
                metadata: logData.metadata,
              });
            }
          } catch (e) {
            // Ignorar líneas que no se pueden parsear como JSON
          }
        }
      }

      // Aplicar filtros
      logs = this.applyFilters(logs, filter);

      // Calcular total y aplicar paginación
      const totalLogs = logs.length;
      logs = this.applyPagination(logs, filter.page, filter.limit);

      return {
        logs,
        totalLogs,
      };
    } catch (error) {
      this.logger.error(`Error al obtener logs: ${error.message}`, error.stack);
      return { logs: [], totalLogs: 0 };
    }
  }

  /**
   * Obtiene la lista de archivos de log
   */
  private getLogFiles(): string[] {
    try {
      if (!fs.existsSync(this.logDir)) {
        return [];
      }

      return fs.readdirSync(this.logDir)
        .filter(file => file.startsWith('application-') && file.endsWith('.log'));
    } catch (error) {
      this.logger.error(`Error al listar archivos de log: ${error.message}`);
      return [];
    }
  }

  /**
   * Aplica los filtros a la lista de logs
   */
  private applyFilters(logs: LogEntry[], filter: LogFilter): LogEntry[] {
    let filteredLogs = [...logs];

    // Filtrar por búsqueda
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        (log.user && log.user.toLowerCase().includes(searchLower)) ||
        (log.action && log.action.toLowerCase().includes(searchLower)) ||
        (log.ip && log.ip.includes(filter.search))
      );
    }

    // Filtrar por fecha
    if (filter.fromDate) {
      const fromDate = new Date(filter.fromDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (filter.toDate) {
      const toDate = new Date(filter.toDate);
      toDate.setHours(23, 59, 59, 999); // Final del día
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate);
    }

    // Ordenar por fecha descendente (más reciente primero)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return filteredLogs;
  }

  /**
   * Aplica la paginación a la lista de logs
   */
  private applyPagination(logs: LogEntry[], page: number, limit: number): LogEntry[] {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return logs.slice(startIndex, endIndex);
  }

  /**
   * Genera un UUID simple para identificar cada entrada
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async generateLogReport(filter: { fromDate?: string, toDate?: string, columns: string[] }): Promise<{ logs: any[], totalLogs: number }> {
    try {
      const { fromDate, toDate, columns } = filter;
      const files = this.getLogFiles();
      let logs: LogEntry[] = [];

      // Leer todos los archivos de log
      for (const file of files) {
        const fileContent = fs.readFileSync(path.join(this.logDir, file), 'utf-8');
        const fileLines = fileContent.split('\n').filter(line => line.trim() !== '');

        for (const line of fileLines) {
          try {
            const parsedLine = JSON.parse(line);
            // Verificar si es un registro de acción de usuario
            if (parsedLine.message === 'User Action') {
              const logData = parsedLine;
              logs.push(logData);
            }
          } catch (e) {
            // Ignorar líneas que no se pueden parsear como JSON
          }
        }
      }

      // Filtrar por fecha
      if (fromDate) {
        const fromDateObj = new Date(fromDate);
        logs = logs.filter(log => new Date(log.timestamp) >= fromDateObj);
      }

      if (toDate) {
        const toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999); // Final del día
        logs = logs.filter(log => new Date(log.timestamp) <= toDateObj);
      }

      // Seleccionar solo las columnas solicitadas
      // Seleccionar solo las columnas solicitadas
      logs = logs.map(log => {
        const filteredLog: any = {};
        columns.forEach(column => {
          // Verificar si la columna es una propiedad anidada
          const keys = column.split('.');  // Para manejar columnas como 'metadata.method'
          let value = log;

          // Navegar por las propiedades anidadas
          keys.forEach(key => {
            value = value ? value[key] : undefined;
          });

          if (value !== undefined) {
            filteredLog[column] = value;
          }
        });
        return filteredLog;
      });


      return { logs, totalLogs: logs.length };
    } catch (error) {
      this.logger.error(`Error al generar el reporte de logs: ${error.message}`, error.stack);
      return { logs: [], totalLogs: 0 };
    }
  }

  // Función para generar el reporte en PDF de los logs
  // public async generateLogsPDFReport(filter: { fromDate?: string, toDate?: string, columns: string[] }): Promise<Buffer> {
  //   // Obtener los logs con los filtros
  //   const { logs } = await this.generateLogReport(filter);

  //   // Verificar si se tienen logs
  //   if (logs.length === 0) {
  //     throw new Error('No se encontraron logs con los filtros especificados');
  //   }

  //   // Generar el reporte en PDF
  //   return this.reportService.generatePDFReport(logs, 'Logs');
  // }

  // Función para generar el reporte en Excel de los logs
  // public async generateLogsExcelReport(filter: { fromDate?: string, toDate?: string, columns: string[] }): Promise<Buffer> {
  //   const { logs } = await this.generateLogReport(filter);

  //   if (logs.length === 0) {
  //     throw new Error('No se encontraron logs con los filtros especificados');
  //   }

  //   // Generar reporte en Excel
  //   return this.reportService.generateExcelReport(logs);
  // }

  // Función para generar y enviar los reportes de logs por correo
  // public async generateAndSendLogsReport(filter: { fromDate?: string, toDate?: string, columns: string[] }, email: string, fileName: string): Promise<void> {
  //   const pdfBuffer = await this.generateLogsPDFReport(filter);
  //   const excelBuffer = await this.generateLogsExcelReport(filter);

  //   // Enviar ambos reportes por correo
  //   await this.reportService.sendReportByEmail(email, pdfBuffer, excelBuffer, fileName);
  // }
} 