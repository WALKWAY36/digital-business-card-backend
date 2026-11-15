import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Project')
export class ProjectModel {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field(() => String, { nullable: true })
  repositoryUrl!: string | null;
}
