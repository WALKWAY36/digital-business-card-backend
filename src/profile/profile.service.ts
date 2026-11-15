import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';

export class ProfileNotFoundError extends Error {
  constructor() {
    super('Public profile was not found');
    this.name = 'ProfileNotFoundError';
  }
}

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async getPublicProfile() {
    const profile = await this.repository.findBySlug('main');

    if (!profile) {
      throw new ProfileNotFoundError();
    }

    return profile;
  }
}
