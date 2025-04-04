import HistoryScreen from './HistoryScreen';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import StatisticsScreen from './StatisticsScreen';
import StreamingScreen from './StreamingScreen';
import { useTranslation } from '@/lib/hooks/useTranslation';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View } from 'react-native';

const Tab = createBottomTabNavigator();

const TABS = [
  {
    name: 'Streaming',
    component: StreamingScreen,
    icon: (color: string, size: number) => <Ionicons name="tv" size={size} color={color} />,
  },
  {
    name: 'History',
    component: HistoryScreen,
    icon: (color: string, size: number) => (
      <FontAwesome6 name="list-ul" size={size} color={color} />
    ),
  },
  {
    name: 'Home',
    component: HomeScreen,
    icon: (color: string, size: number) => (
      <MaterialIcons name="home-filled" size={size} color={color} />
    ),
  },
  {
    name: 'Statistics',
    component: StatisticsScreen,
    icon: (color: string, size: number) => (
      <MaterialIcons name="insert-chart" size={size} color={color} />
    ),
  },
  {
    name: 'Settings',
    component: SettingsScreen,
    icon: (color: string, size: number) => (
      <MaterialIcons name="settings" size={size} color={color} />
    ),
  },
];

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}>
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const { t } = useTranslation();

  return (
    <View className="relative w-full bg-neutral-100 px-2 pb-2">
      <View className="flex-row rounded-xl bg-white p-2 shadow-xl">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (route.name === 'Home')
            return (
              <View className="relative flex-1 items-center p-2" key={index}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  className={`absolute bottom-6 size-[62px] items-center justify-center rounded-full ${isFocused ? 'bg-primary-400' : 'bg-gray-400'}`}
                  style={{
                    shadowColor: isFocused ? '#254a43' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                  {TABS[index].icon('white', 32)}
                </TouchableOpacity>
              </View>
            );
          else
            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                className={`flex-1 items-center py-1 px-2`}>
                {TABS[index].icon(isFocused ? '#3d8d7a' : 'gray', 24)}
                <Text className={`text-[12px] ${isFocused ? 'text-primary-500' : 'text-gray-500'}`}>
                  {t(`tabs.${route.name.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            );
        })}
      </View>
    </View>
  );
}
