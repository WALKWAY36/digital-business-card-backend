import { z } from 'zod';

const text = z.string().trim().min(1);
const id = z.uuid();
const sortOrder = z.number().int().nonnegative();

const url = z
  .url()
  .refine((value) => ['https:', 'http:'].includes(new URL(value).protocol), {
    message: 'Only HTTP and HTTPS URLs are allowed',
  });

const date = z.iso
  .date()
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const period = {
  startDate: date,
  endDate: date.nullable(),
};

function validPeriod(value: {
  startDate: Date;
  endDate: Date | null;
}): boolean {
  return value.endDate === null || value.endDate >= value.startDate;
}

const periodError = {
  message: 'endDate must not precede startDate',
  path: ['endDate'],
};

export const seedSchema = z
  .object({
    profile: z.object({
      id,
      slug: z.literal('main'),
      name: text,
      description: text.nullable(),
    }),

    links: z.array(
      z.object({
        id,
        label: text,
        url,
        sortOrder,
      }),
    ),

    skills: z.array(
      z.object({
        id,
        name: text,
        sortOrder,
      }),
    ),

    experience: z.array(
      z
        .object({
          id,
          company: text,
          position: text,
          ...period,
          achievements: z.array(text),
        })
        .refine(validPeriod, periodError),
    ),

    projects: z.array(
      z.object({
        id,
        name: text,
        description: text.nullable(),
        url: url.nullable(),
        repositoryUrl: url.nullable(),
        sortOrder,
      }),
    ),

    education: z.array(
      z
        .object({
          id,
          name: text,
          degree: text,
          ...period,
        })
        .refine(validPeriod, periodError),
    ),
  })
  .superRefine((data, context) => {
    const collections = {
      links: data.links,
      skills: data.skills,
      experience: data.experience,
      projects: data.projects,
      education: data.education,
    };

    for (const [name, records] of Object.entries(collections)) {
      const ids = new Set<string>();

      records.forEach((record, index) => {
        if (ids.has(record.id)) {
          context.addIssue({
            code: 'custom',
            message: 'Duplicate id',
            path: [name, index, 'id'],
          });
        }

        ids.add(record.id);
      });
    }
  });

export type SeedInput = z.input<typeof seedSchema>;
