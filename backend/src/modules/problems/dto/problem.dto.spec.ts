import { validate } from 'class-validator';
import { CreateProblemDto } from './create-problem.dto';
import { UpdateProblemDto } from './update-problem.dto';
import { Difficulty } from '@prisma/client';

describe('CreateProblemDto', () => {
  it('passes for a valid payload', async () => {
    const dto = new CreateProblemDto();
    dto.categoryId = 'cat1';
    dto.title = 'Two Sum';
    dto.slug = 'two-sum';
    dto.descriptionMd = 'desc';
    dto.difficulty = Difficulty.MEDIUM;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails when required fields are missing', async () => {
    const dto = new CreateProblemDto();
    const errors = await validate(dto);
    const props = errors.map((e) => e.property);
    expect(props).toEqual(
      expect.arrayContaining(['categoryId', 'title', 'slug', 'descriptionMd']),
    );
  });

  it('fails when difficulty is not a valid enum value', async () => {
    const dto = new CreateProblemDto();
    dto.categoryId = 'cat1';
    dto.title = 'T';
    dto.slug = 't';
    dto.descriptionMd = 'd';
    (dto as any).difficulty = 'HARDXXX';
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'difficulty')).toBe(true);
  });

  it('fails when timeLimit is below the minimum', async () => {
    const dto = new CreateProblemDto();
    dto.categoryId = 'cat1';
    dto.title = 'T';
    dto.slug = 't';
    dto.descriptionMd = 'd';
    dto.timeLimit = 10;
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'timeLimit')).toBe(true);
  });
});

describe('UpdateProblemDto', () => {
  it('passes with all fields optional (empty body allowed)', async () => {
    const dto = new UpdateProblemDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails when a provided field has the wrong type', async () => {
    const dto = new UpdateProblemDto();
    (dto as any).title = 123;
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });
});
