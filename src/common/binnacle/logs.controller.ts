import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { LogsService } from './logs.service';
import { AuthGuard } from 'src/auth/guards';
import { ResponseMessage } from '../interfaces/responseMessage.interface';
import { ORDER_ENUM } from '../constants';

@ApiTags('Logs')
@Controller('logs')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class LogsController {
  constructor(private readonly logsService: LogsService) { }

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', enum: ORDER_ENUM, required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @Get()
  // @PermissionAccess(PERMISSION.LOG_SHOW)
  async getLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('search') search = '',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<ResponseMessage> {
    const { logs, totalLogs } = await this.logsService.getLogs({
      page: +page,
      limit: +limit,
      search,
      fromDate,
      toDate,
    });

    return {
      statusCode: 200,
      data: logs,
      countData: totalLogs,
    };
  }

  // Ruta para generar y descargar el reporte en PDF de los logs
  // @Get('pdf')
  // // @PermissionAccess(PERMISSION.LOG_SHOW)
  // @ApiQuery({ name: 'fromDate', required: false, type: String })
  // @ApiQuery({ name: 'toDate', required: false, type: String })
  // @ApiQuery({ name: 'columns', required: true, type: [String] }) // Las columnas seleccionadas para el reporte
  // @ApiQuery({ name: 'fileName', required: true, type: String }) // Nombre del archivo PDF
  // @ApiResponse({
  //   status: 200,
  //   description: 'Reporte PDF generado con éxito',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Error al generar el reporte PDF',
  // })
  // async generatePDFReport(
  //   @Res() res: Response,
  //   @Query('columns') columns: string[], // Añadimos las columnas
  //   @Query('fileName') fileName: string, // Si no se pasa, usamos un nombre predeterminado
  //   @Query('fromDate') fromDate?: string,
  //   @Query('toDate') toDate?: string,
  // ) {
  //   try {
  //     const filter = { fromDate, toDate, columns };
  //     const pdfBuffer = await this.logsService.generateLogsPDFReport(filter);
  //     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); // Nombre del archivo PDF
  //     res.setHeader('Content-Type', 'application/pdf');
  //     res.end(pdfBuffer);
  //   } catch (error) {
  //     res.status(500).send({ message: 'Hubo un error al generar el reporte PDF', error: error.message });
  //   }
  // }

  // // Ruta para generar y descargar el reporte en Excel de los logs
  // @Get('excel')
  // @PermissionAccess(PERMISSION.LOG_SHOW)
  // @ApiQuery({ name: 'fromDate', required: false, type: String })
  // @ApiQuery({ name: 'toDate', required: false, type: String })
  // @ApiQuery({ name: 'columns', required: true, type: [String] }) // Las columnas seleccionadas para el reporte
  // @ApiQuery({ name: 'fileName', required: true, type: String }) // Nombre del archivo Excel
  // @ApiResponse({
  //   status: 200,
  //   description: 'Reporte Excel generado con éxito',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Error al generar el reporte Excel',
  // })
  // async generateExcelReport(
  //   @Res() res: Response,
  //   @Query('columns') columns: string[], // Añadimos las columnas
  //   @Query('fileName') fileName: string, // Si no se pasa, usamos un nombre predeterminado
  //   @Query('fromDate') fromDate?: string,
  //   @Query('toDate') toDate?: string,
  // ) {
  //   try {
  //     const filter = { fromDate, toDate, columns };
  //     const excelBuffer = await this.logsService.generateLogsExcelReport(filter);
  //     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); // Nombre del archivo Excel
  //     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  //     res.end(excelBuffer);
  //   } catch (error) {
  //     res.status(500).send({ message: 'Hubo un error al generar el reporte Excel', error: error.message });
  //   }
  // }

  // // Ruta para generar y enviar los reportes por correo
  // @Get('send')
  // @PermissionAccess(PERMISSION.LOG_SHOW)
  // @ApiQuery({ name: 'fromDate', required: false, type: String })
  // @ApiQuery({ name: 'toDate', required: false, type: String })
  // @ApiQuery({ name: 'email', required: true, type: String })
  // @ApiQuery({ name: 'fileName', required: true, type: String }) // Nombre del archivo enviado por correo
  // @ApiQuery({ name: 'columns', required: true, type: [String] }) // Las columnas seleccionadas para el reporte
  // @ApiResponse({
  //   status: 200,
  //   description: 'Reportes generados y enviados por correo con éxito',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Error al generar o enviar los reportes por correo',
  // })
  // async generateAndSendReport(
  //   @Query('email') email: string,
  //   @Query('fileName') fileName: string, // Si no se pasa, usamos un nombre predeterminado
  //   @Query('columns') columns: string[], // Añadimos las columnas
  //   @Query('fromDate') fromDate?: string,
  //   @Query('toDate') toDate?: string,
  // ) {
  //   const filter = { fromDate, toDate, columns };

  //   try {
  //     await this.logsService.generateAndSendLogsReport(filter, email, fileName);
  //     return { message: 'Reportes generados y enviados por correo con éxito' };
  //   } catch (error) {
  //     return { message: 'Hubo un error al generar o enviar los reportes', error: error.message };
  //   }
  // }
} 