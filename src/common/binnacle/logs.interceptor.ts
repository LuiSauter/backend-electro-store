import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from './logs.service';
import { Request } from 'express';
import { UserService } from 'src/users/services/users.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LoggingInterceptor');

  constructor(
    private readonly logsService: LogsService,
    private readonly userService: UserService
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      const { method, url, body, params, query } = request;
      const userId = request.userId; // Obtenido del AuthGuard
      const ip = this.getClientIp(request);

      // Solo registrar acciones importantes (POST, PUT, PATCH, DELETE)
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        try {
          // Determinar qué acción se está realizando
          const action = this.getActionDescription(method, url);

          // Obtener el nombre del usuario según el contexto
          let userName = 'anonymous';

          // Caso especial para login: buscar el usuario por email
          if (url.includes('/api/login') && body && body.email) {
            try {
              // Intentar buscar el usuario por email
              const user = await this.userService.findOneBy({
                key: 'email',
                value: body.email
              });
              userName = user.name || body.email;
            } catch (error) {
              // Si el usuario no se encuentra, usar el email como última opción
              userName = body.email;
              this.logger.warn(`No se pudo encontrar usuario con email ${body.email} para el log de inicio de sesión`);
            }
          }
          // Para otras acciones, obtener el usuario de la sesión
          else if (userId) {
            try {
              const user = await this.userService.findOne(userId);
              userName = user.name || user.email || userId;
            } catch (error) {
              this.logger.error(`Error al obtener información del usuario: ${error.message}`);
            }
          }

          // Crear timestamp para asegurar formato correcto
          const timestamp = new Date().toISOString();

          this.logsService.logAction({
            user: userName,
            ip,
            action,
            metadata: {
              method,
              url,
              body: this.sanitizeBody(body),
              params,
              query,
              timestamp
            }
          }).catch(error => {
            this.logger.error('Error al registrar log:', error);
          });
        } catch (error) {
          this.logger.error(`Error en interceptor de logs: ${error.message}`, error.stack);
        }
      }
    }

    return next.handle();
  }

  private getClientIp(request: Request): string {
    const ip = request.ip ||
      request.headers['x-forwarded-for'] ||
      'unknown';

    return Array.isArray(ip) ? ip[0] : ip;
  }

  private getActionDescription(method: string, url: string): string {
    // URLs para autenticación
    if (url.includes('/api/login')) return 'Inició sesión';
    if (url.includes('/api/register')) return 'Registró un nuevo usuario';
    if (url.includes('/api/logout')) return 'Cerró sesión';

    // URLs para usuarios
    if (url.includes('/api/user') && method === 'POST') return 'Creó un usuario';
    if (url.includes('/api/user') && (method === 'PUT' || method === 'PATCH')) return 'Actualizó un usuario';
    if (url.includes('/api/user') && method === 'DELETE') return 'Eliminó un usuario';

    // URLs para productos
    if (url.includes('/api/products') && method === 'POST') return 'Creó un producto';
    if (url.includes('/api/products') && (method === 'PUT' || method === 'PATCH')) return 'Actualizó un producto';
    if (url.includes('/api/products') && method === 'DELETE') return 'Eliminó un producto';
    if (url.includes('/api/products')) return 'Consultó productos';

    // Por método (para otras URLs no específicas)
    switch (method) {
      case 'POST': return `Creó un registro en ${this.getResourceName(url)}`;
      case 'PUT':
      case 'PATCH': return `Actualizó un registro en ${this.getResourceName(url)}`;
      case 'DELETE': return `Eliminó un registro en ${this.getResourceName(url)}`;
      default: return `Acción ${method} en ${url}`;
    }
  }

  private getResourceName(url: string): string {
    // Extraer el recurso principal de la URL (ej: /api/users/123 -> users)
    const parts = url.split('/').filter(Boolean);
    if (parts.length > 1 && parts[0] === 'api') {
      return parts[1]; // Devuelve el recurso después de 'api'
    }
    return parts.length > 0 ? parts[0] : 'desconocido';
  }

  private sanitizeBody(body: any): any {
    if (!body) return {};

    // Crear una copia para no modificar el original
    const sanitized = { ...body };

    // Eliminar campos sensibles
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
} 