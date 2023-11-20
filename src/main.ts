import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "body-parser";
import { readFileSync } from "fs";
import { AppModule } from "./app.module";
import { PrismaClientExceptionFilter } from "./prisma-exception/prisma-exception.filter";

async function bootstrap() {
  const ssl = process.env.SSL === "true" ? true : false;
  let httpsOptions;
  if (ssl) {
    httpsOptions = {
      key: readFileSync(process.env.SSL_KEY_PATH!),
      cert: readFileSync(process.env.SSL_CERT_PATH!),
      host: "152.69.230.5:9999",
      port: 9999,
    };
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("공부용 API")
    .setDescription("NESTJS 공부용 API 문서입니다.")
    .setVersion("0.1")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  app.setGlobalPrefix("api");

  app.use(json({ limit: "15mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(9999);
}
bootstrap();
