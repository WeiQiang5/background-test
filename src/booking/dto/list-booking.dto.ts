import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';
import { PaginDto } from 'src/common/dto';

export class ListBookingDto extends PaginDto {
  @ApiProperty({
    type: String,
    description: '用户名',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;
  @ApiProperty({
    type: String,
    description: '会议室名称',
    required: false,
  })
  @IsString()
  @IsOptional()
  meetingRoomName?: string;
  @ApiProperty({
    type: String,
    description: '会议室位置',
    required: false,
  })
  @IsString()
  @IsOptional()
  meetingRoomPosition?: string;
  @ApiProperty({
    type: String,
    description: '开始时间',
    required: false,
  })
  @IsString()
  @IsOptional()
  bookingTimeRangeStart?: string;
  @ApiProperty({
    type: String,
    description: '结束时间',
    required: false,
  })
  @IsString()
  @IsOptional()
  bookingTimeRangeEnd?: string;
}
