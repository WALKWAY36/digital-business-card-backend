import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string) {
    return this.prisma.profile.findUnique({
      where: { slug },
      include: {
        links: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
        skills: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
        experiences: {
          orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
        },
        projects: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
        educations: {
          orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
        },
      },
    });
  }
}
