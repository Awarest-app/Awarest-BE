// src/subquestion/subquestion.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
} from '@nestjs/common';
import { SubquestionService } from './subquestion.service';
import { CreateSubquestionDto } from './dto/create-subquestion.dto';
import { UpdateSubquestionDto } from './dto/update-subquestion.dto';
import { jwtRequest } from '@/type/request.interface';
import { Subquestion } from '@/entities/subquestion.entity';
// import { CreateSubquestionDto, UpdateSubquestionDto } from './dto';

@Controller('api/subquestions')
export class SubquestionController {
  constructor(private readonly subqService: SubquestionService) {}

  @Get(':id')
  async findOne(@Req() request: jwtRequest, @Param('id') id: number) {
    // 여기서 queryid 는 questionId 입니다.
    console.log('subquestion.controller.ts: request.user', id);

    // userId와 questionId를 이용해서 subquestion을 가져옵니다.
    // ★ 여기서 await 추가
    const tes = await this.subqService.findById(id);

    // 이제 tes는 실제 Subquestion[] (또는 다른 반환형) 값
    // console.log('tes', tes);
    return tes;
  }

  // @Put('update/:id')
  // async update(@Param('id') id: number, @Body() updateDto: string) {
  //   // 여기서 id는 subquestionId
  //   return this.subqService.update(id, updateDto);
  // }

  @Post()
  async create(@Body() createDto: CreateSubquestionDto) {
    return this.subqService.create(createDto);
  }

  @Get()
  async findAll() {
    return this.subqService.findAll();
  }

  // @Put(':id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateDto: UpdateSubquestionDto,
  // ) {
  //   return this.subqService.update(id, updateDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: number) {
  //   return this.subqService.remove(id);
  // }
}
