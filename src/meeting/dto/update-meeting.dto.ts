import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMeetingRoomDto } from './create-meeting.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateMeetingDto extends PartialType(CreateMeetingRoomDto) {
  @ApiProperty({
    type: Number,
    description: 'id',
    required: true,
  })
  @IsNotEmpty({
    message: 'id不能为空',
  })
  id: number;
}
