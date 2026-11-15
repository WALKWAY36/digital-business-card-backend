import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ProfileLink')
export class ProfileLinkModel {
  @Field(() => String)
  label!: string;

  @Field(() => String)
  url!: string;
}
