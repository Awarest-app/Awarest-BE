// src/subquestion/subquestion.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Req,
  Delete,
} from '@nestjs/common';
import { SubquestionService } from './subquestion.service';
import { jwtRequest } from '@/type/request.interface';
// import { IQuestionProps } from '@/questions/dto/question.dto';
// import { CreateSubquestionDto, UpdateSubquestionDto } from './dto';

@Controller('api/subquestions')
export class SubquestionController {
  constructor(private readonly subqService: SubquestionService) {}

  // Question에 대한 subquestion 반환
  @Get('admin/:id')
  async getSubQuestion(@Param('id') id: number) {
    const questionId = Number(id);
    return await this.subqService.findSubquestion(questionId);
  }

  // mobile main에서 question, subquestion을 가져오는 부분
  @Get(':id')
  async findOne(@Req() request: jwtRequest, @Param('id') id: number) {
    // 여기서 queryid 는 questionId 입니다.
    // console.log('subquestion.controller.ts: request.user', id);

    // userId와 questionId를 이용해서 subquestion을 가져옵니다.
    // ★ 여기서 await 추가
    const tes = await this.subqService.findById(id);

    // 이제 tes는 실제 Subquestion[] (또는 다른 반환형) 값
    // console.log('tes', tes);
    return tes;
  }

  @Put('admin/update/:id')
  async update(@Param('id') id: number, @Body() body: { content: string }) {
    // console.log('subquestion.controller.ts: update', id, body.content);
    return this.subqService.update(id, body.content);
  }

  @Delete('delete/:subquestionId')
  async delete(@Param('subquestionId') subquestionId: number) {
    return this.subqService.remove(subquestionId);
  }

  // // 새로운 질문 생성하는 부분 TODO -> 무조건 Question으로 변경하기
  // @Post('/admin/create')
  // async createNewQuestion(@Body() body: { content: IQuestionProps }) {
  //   const { question_content, subquestion, depth } = body.content;

  //   const savedQuestion = await this.subqService.createQuestion(
  //     question_content,
  //     subquestion,
  //     depth,
  //   );
  //   return { success: true, questionId: savedQuestion.questionId };
  // }

  // subquestion 하나만 생성
  @Post('/admin/create')
  async create(@Body() body: { questionId: number; content: string }) {
    return this.subqService.create(body.questionId, body.content);
  }
}
