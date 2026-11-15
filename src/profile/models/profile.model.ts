import { Field, ObjectType } from '@nestjs/graphql';
import { EducationModel } from './education.model';
import { ExperienceModel } from './experience.model';
import { ProfileLinkModel } from './profile-link.model';
import { ProjectModel } from './project.model';
import { SkillModel } from './skill.model';

@ObjectType('Profile')
export class ProfileModel {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => [ProfileLinkModel])
  links!: ProfileLinkModel[];

  @Field(() => [SkillModel])
  skills!: SkillModel[];

  @Field(() => [ExperienceModel])
  experiences!: ExperienceModel[];

  @Field(() => [ProjectModel])
  projects!: ProjectModel[];

  @Field(() => [EducationModel])
  educations!: EducationModel[];
}
