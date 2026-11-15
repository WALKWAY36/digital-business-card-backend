import { Logger } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ProfileModel } from './models/profile.model';
import { ProfileNotFoundError, ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  private readonly logger = new Logger(ProfileResolver.name);

  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileModel, { name: 'profile' })
  async getProfile(): Promise<ProfileModel> {
    try {
      return await this.profileService.getPublicProfile();
    } catch (error: unknown) {
      if (error instanceof ProfileNotFoundError) {
        throw new GraphQLError('Public profile was not found', {
          extensions: {
            code: 'PROFILE_NOT_FOUND',
          },
        });
      }

      this.logger.error({
        event: 'profile_query_failed',
        errorType: error instanceof Error ? error.name : 'Unknown',
      });

      throw new GraphQLError('Unable to load profile', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    }
  }
}
