import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    type: Number,
    description: '会议室名称',
    required: true,
  })
  @IsNotEmpty({ message: '会议室名称不能为空' })
  @IsNumber()
  meetingRoomId: number;
  @ApiProperty({
    type: Number,
    description: '开始时间',
    required: true,
  })
  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsNumber()
  startTime: number;

  @ApiProperty({
    type: Number,
    description: '结束时间',
    required: true,
  })
  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsNumber()
  endTime: number;
  note: string;
}
