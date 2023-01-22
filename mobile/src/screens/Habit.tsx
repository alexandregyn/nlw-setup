import clsx from "clsx";
import { View, ScrollView, Text, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { BackButton } from "../components/BackButton";
import { Checkbox } from "../components/Checkbox";
import { ProgressBar } from "../components/ProgressBar";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";
import { HabitsEmpty } from "../components/HabitsEmpty";

interface Params {
  date: string;
}

interface Habit {
  id: string;
  title: string;
  created_at: string;
}

interface DayInfoProps {
  possibleHabits: Array<Habit>;
  completedHabits: Array<string>;
}

export function Habit() {
  const [loading, setLoading] = useState(true);
  const [dayInfo, setDayInfo] = useState<DayInfoProps>();
  const [completedHabits, setCompletedHabits] = useState<Array<string>>([]);

  const route = useRoute();
  const { date } = route.params as Params;

  const parsedDate = dayjs(date);
  const isDateInPast = parsedDate.endOf('date').isBefore(new Date());
  const dayOfWeek = parsedDate.format('dddd');
  const dayAndMonth = parsedDate.format('DD/MM');

  const habitsProgress = dayInfo?.possibleHabits && dayInfo?.possibleHabits.length > 0 ?
    generateProgressPercentage(dayInfo?.possibleHabits.length, completedHabits.length) : 0;

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('day', { params: { date } });
      setDayInfo(data);
      setCompletedHabits(data.completedHabits);
    } catch (error) {
      console.log(error);
      Alert.alert('Ops!', 'Não foi possível carregar as informações do hábito');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleHabit = async (habitId: string) => {
    try {
      await api.patch(`habits/${habitId}/toggle`);
      if (completedHabits.includes(habitId)) {
        setCompletedHabits(prevState => prevState.filter(id => id !== habitId));
      } else {
        setCompletedHabits(prevState => [...prevState, habitId]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Ops!', 'Não foi possível atualizar o status do hábito.');
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  if (loading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-extrabold text-base lowercase">
          {dayOfWeek}
        </Text>

        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={habitsProgress} />

        <View className={clsx("mt-6", {
          ["opacity-50"]: isDateInPast
        })}>
          {
            dayInfo?.possibleHabits ?
              dayInfo.possibleHabits.map(habit => (
                <Checkbox
                  key={habit.id}
                  title={habit.title}
                  disabled={isDateInPast}
                  checked={completedHabits.includes(habit.id)}
                  onPress={() => handleToggleHabit(habit.id)}
                />
              ))
              : <HabitsEmpty />
          }
        </View>

        {
          isDateInPast && (
            <Text className="text-white mt-10 text-center">
              Você não pode editar hábitos de uma data passada.
            </Text>
          )
        }
      </ScrollView>
    </View>
  );
}