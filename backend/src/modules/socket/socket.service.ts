import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocketConnection, SocketConnectionDocument } from 'src/schema/socketConnection.schema';

@Injectable()
export class SocketService {
    constructor(
        @InjectModel(SocketConnection.name) private socketSchema: Model<SocketConnectionDocument>
    ) { }

    // Upsert: ensures single active socketId per user
  async saveConnection(userId: string, role: string, socketId: string) {
    await this.socketSchema.deleteOne({ socketId }).catch(() => {});
    return this.socketSchema.findOneAndUpdate(
      { userId },
      { userId, role, socketId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
  }

  async removeConnectionBySocketId(socketId: string) {
    return this.socketSchema.deleteOne({ socketId });
  }

  async removeConnectionByUserId(userId: string) {
    return this.socketSchema.deleteOne({ userId });
  }

  async getSocketIdByUserId(userId: string): Promise<string | null> {
    const rec = await this.socketSchema.findOne({ userId }).lean();
    return rec ? rec.socketId : null;
  }

  async getAllConnectionsByRole(role: string) {
    return this.socketSchema.find({ role }).lean();
  }
}
