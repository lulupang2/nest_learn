import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { urlencoded, json } from "body-parser";
import { readFileSync } from "fs";

async function bootstrap() {
  const ssl = process.env.SSL === "true" ? true : false;
  let httpsOptions;
  if (ssl) {
    httpsOptions = {
      key: readFileSync(process.env.SSL_KEY_PATH!),
      cert: readFileSync(process.env.SSL_CERT_PATH!),
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

  await app.listen(9999);
}
bootstrap();
