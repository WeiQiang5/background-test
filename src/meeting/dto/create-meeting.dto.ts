import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMeetingRoomDto {
  @ApiProperty({
    type: String,
    description: '会议室名称',
    required: true,
  })
  @IsNotEmpty({
    message: '会议室名称不能为空',
  })
  @MaxLength(10, {
    message: '会议室名称最长为 10 字符',
  })
  name: string;
  @ApiProperty({
    type: Number,
    description: '容量',
    required: true,
    uniqueItems: true,
  })
  @IsNotEmpty({
    message: '容量不能为空',
  })
  capacity: number;
  @ApiProperty({
    type: String,
    description: '位置',
    required: true,
  })
  @IsNotEmpty({
    message: '位置不能为空',
  })
  @MaxLength(50, {
    message: '位置最长为 50 字符',
  })
  location: string;

  @ApiProperty({
    type: String,
    description: '设备',
    required: true,
  })
  @IsNotEmpty({
    message: '设备不能为空',
  })
  @MaxLength(50, {
    message: '设备最长为 50 字符',
  })
  equipment: string;

  @ApiProperty({
    type: String,
    description: '描述',
    required: true,
    maximum: 100,
  })
  @IsNotEmpty({
    message: '描述不能为空',
  })
  @MaxLength(100, {
    message: '描述最长为 100 字符',
  })
  description: string;
}
