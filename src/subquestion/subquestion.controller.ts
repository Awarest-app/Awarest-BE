// src/subquestion/subquestion.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SubquestionService } from './subquestion.service';
import { CreateSubquestionDto } from './dto/create-subquestion.dto';
import { UpdateSubquestionDto } from './dto/update-subquestion.dto';
// import { CreateSubquestionDto, UpdateSubquestionDto } from './dto';

@Controller('subquestions')
export class SubquestionController {
  constructor(private readonly subqService: SubquestionService) {}

  @Post()
  async create(@Body() createDto: CreateSubquestionDto) {
    return this.subqService.create(createDto);
  }

  @Get()
  async findAll() {
    return this.subqService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.subqService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateSubquestionDto,
  ) {
    return this.subqService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.subqService.remove(id);
  }
}
