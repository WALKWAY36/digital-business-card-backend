import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType('Education')
export class EducationModel {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  degree!: string;

  @Field(() => GraphQLISODateTime)
  startDate!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate!: Date | null;
}
