import { UserRole } from '@/core/enum/user-role.enum';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserFactory } from 'test/factories/make-user';
import request from 'supertest';

describe('Delete User (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userFactory: UserFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[DELETE] /users/:id', async () => {
    const user = await userFactory.makePrismaUser({
      role: UserRole.Admin,
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const userId = user.id.toString();

    const response = await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(204);

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    expect(userOnDatabase).toBeNull();
  });
});
