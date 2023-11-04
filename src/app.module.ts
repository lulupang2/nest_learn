import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [PrismaModule, BoardModule]
})
export class AppModule {}
