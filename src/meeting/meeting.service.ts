import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Like, Repository } from 'typeorm';
import { MeetingRoom } from './entities/meeting.entity';
import { CreateMeetingRoomDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ListMeetingDto } from './dto/list-meeting.dto';

@Injectable()
export class MeetingService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  @InjectEntityManager()
  entityManager: EntityManager;

  initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    this.repository.insert([room1, room2, room3]);
  }

  async find(query: ListMeetingDto) {
    console.log(query);
    const skipCount = (query.pageNo - 1) * query.pageSize;

    const params: Record<string, any> = {};
    if (query.name && query.name.trim() !== '') {
      params.name = Like(`%${query.name}%`);
    }
    if (query.capacity) {
      params.capacity = Like(`%${query.capacity}%`);
    }
    if (query.equipment && query.equipment.trim() !== '') {
      params.equipment = query.equipment;
    }

    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      where: params,
      skip: skipCount,
      take: query.pageSize,
      order: { createTime: 'DESC' },
    });

    return {
      list: meetingRooms,
      total: totalCount,
    };
  }
  async findById(id: number) {
    const room = await this.repository.findOneBy({
      id,
    });
    if (!room) {
      throw new BadRequestException('会议室不存在');
    }
    return room;
  }
  async create(createMeetingdto: CreateMeetingRoomDto) {
    const room = await this.repository.findOne({
      where: {
        name: createMeetingdto.name,
      },
    });
    if (room) {
      throw new BadRequestException('会议室名字已存在');
    }
    const newRoom = await this.repository.create(createMeetingdto);
    try {
      await this.repository.save(newRoom);
      return newRoom;
    } catch (err) {
      console.log(err);
      throw new BadRequestException('创建失败');
    }
  }

  async update(updateMeetingdto: UpdateMeetingDto) {
    const room = await this.repository.findOne({
      where: {
        id: updateMeetingdto.id,
      },
    });

    if (!room) {
      throw new BadRequestException('会议室不存在');
    }

    room.capacity = updateMeetingdto.capacity;
    room.location = updateMeetingdto.location;
    room.name = updateMeetingdto.name;

    if (room.description) {
      room.description = updateMeetingdto.description;
    }
    if (room.equipment) {
      room.equipment = updateMeetingdto.equipment;
    }

    try {
      return await this.repository.update(
        {
          id: updateMeetingdto.id,
        },
        room,
      );
    } catch (err) {
      console.log(err);
      throw new BadRequestException('更新失败');
    }
  }
  async removeById(id: number) {
    const room = await this.repository.findOneBy({
      id,
    });
    if (!room) {
      throw new BadRequestException('会议室不存在');
    }
    try {
      return await this.repository.delete(id);
    } catch (err) {
      console.log(err);
      throw new BadRequestException('删除失败');
    }
  }
}
