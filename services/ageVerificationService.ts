interface AgeVerificationData {
  isVerified: boolean;
  timestamp: number;
  pinHash: string;
}

interface UserPreferences {
  ageConfirmed: boolean;
  customPin: string;
  lastAccess: number;
}

class AgeVerificationService {
  private static instance: AgeVerificationService;
  private storageKey = "knoux_age_verification";
  private prefsKey = "knoux_user_prefs";

  static getInstance(): AgeVerificationService {
    if (!AgeVerificationService.instance) {
      AgeVerificationService.instance = new AgeVerificationService();
    }
    return AgeVerificationService.instance;
  }

  private hashPin(pin: string): string {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  setCustomPin(pin: string): boolean {
    if (pin.length < 4) return false;

    const prefs: UserPreferences = {
      ageConfirmed: false,
      customPin: this.hashPin(pin),
      lastAccess: Date.now(),
    };

    localStorage.setItem(this.prefsKey, JSON.stringify(prefs));
    return true;
  }

  hasCustomPin(): boolean {
    const prefs = this.getUserPreferences();
    return prefs?.customPin ? true : false;
  }

  private getUserPreferences(): UserPreferences | null {
    try {
      const data = localStorage.getItem(this.prefsKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  verifyAge(): boolean {
    const prefs = this.getUserPreferences();
    if (!prefs) return false;

    const verification: AgeVerificationData = {
      isVerified: true,
      timestamp: Date.now(),
      pinHash: prefs.customPin,
    };

    prefs.ageConfirmed = true;
    prefs.lastAccess = Date.now();

    localStorage.setItem(this.storageKey, JSON.stringify(verification));
    localStorage.setItem(this.prefsKey, JSON.stringify(prefs));

    return true;
  }

  verifyPin(pin: string): boolean {
    const prefs = this.getUserPreferences();
    if (!prefs || !prefs.customPin) return false;

    const inputHash = this.hashPin(pin);
    return inputHash === prefs.customPin;
  }

  isAgeVerified(): boolean {
    try {
      const verification = localStorage.getItem(this.storageKey);
      if (!verification) return false;

      const data: AgeVerificationData = JSON.parse(verification);
      const hoursSinceVerification =
        (Date.now() - data.timestamp) / (1000 * 60 * 60);

      return data.isVerified && hoursSinceVerification < 24;
    } catch {
      return false;
    }
  }

  hasCompletedAgeVerification(): boolean {
    const prefs = this.getUserPreferences();
    return prefs?.ageConfirmed && this.isAgeVerified();
  }

  revokeAccess(): void {
    localStorage.removeItem(this.storageKey);
    const prefs = this.getUserPreferences();
    if (prefs) {
      prefs.ageConfirmed = false;
      localStorage.setItem(this.prefsKey, JSON.stringify(prefs));
    }
  }

  getSessionInfo() {
    const prefs = this.getUserPreferences();
    const verification = localStorage.getItem(this.storageKey);

    return {
      hasPin: this.hasCustomPin(),
      isVerified: this.isAgeVerified(),
      hasCompletedSetup: this.hasCompletedAgeVerification(),
      lastAccess: prefs?.lastAccess || 0,
      verificationTime: verification ? JSON.parse(verification).timestamp : 0,
    };
  }
}

export default AgeVerificationService;
