// src/question-mapping/question-mapping.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
// import { CreateQuestionMappingDto, UpdateQuestionMappingDto } from './dto';
import { QuestionMappingService } from './question-mapping.service';
import { CreateQuestionMappingDto } from './dto/create-question-mapping.dto';
import { UpdateQuestionMappingDto } from './dto/update-question-mapping.dto';

@Controller('api/question-mappings')
export class QuestionMappingController {
  constructor(private readonly qmService: QuestionMappingService) {}

  // 설문 매핑 생성 엔드포인트
  @Post('admin')
  async create(@Body() createDto: CreateQuestionMappingDto) {
    return this.qmService.create(createDto);
  }

  // 모든 설문 매핑 조회 엔드포인트
  @Get()
  async findAll() {
    return this.qmService.findAll();
  }

  // 특정 ID의 설문 매핑 조회 엔드포인트
  @Get('admin/:id')
  async findOne(@Param('id') id: number) {
    return this.qmService.findByQuestion(id);
  }

  // 설문 매핑 업데이트 엔드포인트
  @Put('admin/:id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateQuestionMappingDto,
  ) {
    return this.qmService.update(id, updateDto);
  }

  // 설문 매핑 삭제 엔드포인트
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.qmService.remove(id);
  }
}
