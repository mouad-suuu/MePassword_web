import {UserService} from './user';
import {PasswordsService} from './passwords';
import {KeysService} from './keys';
import {SettingsService} from './settings';
import {DeviceService} from './Device';

// Create instances of services
const userService = new UserService();
const passwordService = new PasswordsService();
const keyService = new KeysService();
const settingsService = new SettingsService();
const deviceService = new DeviceService();

export default class Database {
 public static userService = userService;
 public static passwordService = passwordService;
 public static keyService = keyService;
 public static settingsService = settingsService;
 public static deviceService = deviceService;
}

// Export instances for direct use if needed
export {
  userService,
  passwordService,
  keyService,
  settingsService,
  deviceService
};