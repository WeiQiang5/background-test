import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ListBookingDto } from './dto/list-booking.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserInfo, RequireLogin } from 'src/decorator/user.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('预定管理')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiOperation({ summary: '预定列表' })
  @Get('list')
  list(@Query() listBookingDto: ListBookingDto) {
    return this.bookingService.find(listBookingDto);
  }

  @ApiOperation({ summary: '新增预定列表' })
  @RequireLogin()
  @Get('add')
  add(
    @Body() booking: CreateBookingDto,
    @GetUserInfo('userId') userId: number,
  ) {
    this.bookingService.add(booking, userId);
    return '新增成功';
  }

  @ApiOperation({ summary: '审批通过' })
  @Get('apply/:id')
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id);
  }
  @ApiOperation({ summary: '审批驳回' })
  @Get('reject/:id')
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
  }
  @ApiOperation({ summary: '解除' })
  @Get('unbind/:id')
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
  }
  @ApiOperation({ summary: '催办' })
  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }
}
