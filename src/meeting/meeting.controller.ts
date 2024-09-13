import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  Put,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { generateParseIntPipe } from 'src/utils/pipe';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateMeetingRoomDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ListMeetingDto } from './dto/list-meeting.dto';

@ApiTags('会议室')
@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Get('list')
  @ApiOperation({ summary: '会议室列表' })
  async list(@Query() query: ListMeetingDto) {
    return await this.meetingService.find(query);
  }

  @Post('create')
  @ApiBody({ type: CreateMeetingRoomDto })
  @ApiOperation({ summary: '创建会议室' })
  async create(@Body() createMeetingdto: CreateMeetingRoomDto) {
    await this.meetingService.create(createMeetingdto);
    return '创建成功';
  }
  @Patch('update')
  @ApiBody({ type: UpdateMeetingDto })
  @ApiOperation({ summary: '更新会议室' })
  async update(@Body() updateMeetingDto: UpdateMeetingDto) {
    await this.meetingService.update(updateMeetingDto);
    return '更新成功';
  }

  @Get(':id')
  @ApiOperation({ summary: '会议室详情' })
  async find(@Param('id') id: number) {
    return await this.meetingService.findById(id);
  }
  @Delete(':id')
  @ApiOperation({ summary: '删除会议室' })
  async delete(@Param('id') id: number) {
    await this.meetingService.removeById(id);
    return '删除成功';
  }
}
