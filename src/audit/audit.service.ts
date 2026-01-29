import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly repo: Repository<AuditLog>,
    ) {}

    async create(entry: Partial<AuditLog>) {
        const row = this.repo.create(entry);
        await this.repo.save(row);
    }
}