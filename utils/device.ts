import { sql } from "@vercel/postgres";
import { Device } from "../types";
import { upsertDevice, getUserDevices, deactivateDevice } from "./database";

export class Devices {
  /**
   * Check if a device exists and update its last active timestamp
   */
  public static async ExistedDevices(
    userId: string,
    browser: string,
    os: string,
    source: 'web' | 'extension' | 'unknown'
  ): Promise<Device | null> {
    try {
      // Get all user devices
      const devices = await getUserDevices(userId);
      
      // Find matching device
      const existingDevice = devices.find(
        device => 
          device.browser === browser && 
          device.os === os && 
          device.source === source
      );

      if (existingDevice) {
        // Update last active timestamp
        await upsertDevice(userId, browser, os, existingDevice.deviceName, source);
        return existingDevice;
      }

      return null;
    } catch (error) {
      console.error('[ExistedDevices] Error:', error);
      throw error;
    }
  }

  /**
   * Register a new device or update existing one
   */
  public static async IsNewDevices(
    userId: string,
    browser: string,
    os: string,
    source: 'web' | 'extension' | 'unknown'
  ): Promise<Device> {
    try {
      // Check if device exists
      const existingDevice = await this.ExistedDevices(userId, browser, os, source);
      
      if (!existingDevice) {
        // Register new device
        console.log('[IsNewDevices] Registering new device');
        return await upsertDevice(userId, browser, os, undefined, source);
      }

      console.log('[IsNewDevices] Device already exists');
      return existingDevice;
    } catch (error) {
      console.error('[IsNewDevices] Error:', error);
      throw error;
    }
  }

  /**
   * Handle device check during auth token verification
   */
  public static async handleDeviceCheck(
    userId: string,
    browser: string,
    os: string,
    source: 'web' | 'extension' | 'unknown'
  ): Promise<Device> {
    try {
      // Always try to register/update device during token check
      return await this.IsNewDevices(userId, browser, os, source);
    } catch (error) {
      console.error('[handleDeviceCheck] Error:', error);
      throw error;
    }
  }
}