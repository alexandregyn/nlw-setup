import { prisma } from "./prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import dayjs from "dayjs";

export const appRoutes = async (app: FastifyInstance) => {
  app.post('/habits', async (request, response) => {
    const createHabiBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    });

    const { title, weekDays } = createHabiBody.parse(request.body);

    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(weekDay => {
            return {
              week_day: weekDay
            }
          })
        }
      }
    })
  });

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date()
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf('day');
    const weekDay = parsedDate.get('day');

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date
        },
        weekDays: {
          some: {
            week_day: weekDay
          }
        }
      }
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate()
      },
      include: {
        dayHabits: true
      }
    });

    const completedHabits = day?.dayHabits.map(dayHabit => {
      return dayHabit.habit_id
    }) ?? [];

    return {
      possibleHabits,
      completedHabits
    };
  });

  app.patch('/habits/:id/toggle', async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid()
    });

    const { id } = toggleHabitParams.parse(request.params);

    const today = dayjs().startOf('day').toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today
      }
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today
        }
      })
    }

    const dayHabit = await prisma.dayhabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id
        }
      }
    });

    if (dayHabit) {
      await prisma.dayhabit.delete({
        where: {
          id: dayHabit.id
        }
      })
    } else {
      await prisma.dayhabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        }
      });
    }
  });

  app.get('/summary', async (request) => {
    const summary = await prisma.$queryRaw`
      select
        D.id,
        D.date,
        (
          select
            CAST(count(*) as float)
          from
            dayhabits DH
          where
            DH.day_id = D.id
          ) as completed,
          (
            SELECT 
              CAST(count(*) as float)
          from habitweekdays HWD
          join habits H 
            on H.id = HWD.habit_id			
          WHERE 
            HWD.week_day = cast(STRFTIME('%w', D.date/1000.0, 'unixepoch') as int)
            and H.created_at <= D.date
          ) as amount
      from days D
    `
    return summary;
  });
}