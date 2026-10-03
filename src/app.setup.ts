import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from './presentation/http/filters/domain-exception.filter.js';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());

  if (process.env.NODE_ENV !== 'test') {
    const config = new DocumentBuilder()
      .setTitle('api-b2b')
      .setDescription(
        'API de gestão comercial B2B: catálogo com preço por contrato, pedidos com limite de crédito e reserva de estoque.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }
}
