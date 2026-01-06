// Medication Model
export class Medication {
    constructor({
        id = null,
        name = '',
        dosage = '',
        times = [],
        frequency = 'daily', // Legacy field, kept for backward compatibility
        frequencyType = 'daily', // 'daily', 'specific_days', 'interval'
        selectedDays = [], // Array of numbers 0-6 (Sun-Sat)
        intervalDays = 1, // Number of days for interval
        startDate = new Date(),
        notes = '',
        isActive = true,
    }) {
        this.id = id || `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.dosage = dosage;
        this.times = times; // Array of time strings like ["08:00", "20:00"]
        this.frequency = frequency;
        this.frequencyType = frequencyType;
        this.selectedDays = selectedDays; // 0 = Sunday, 1 = Monday, etc.
        this.intervalDays = intervalDays;
        this.startDate = startDate;
        this.notes = notes;
        this.isActive = isActive;
        this.createdAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            dosage: this.dosage,
            times: this.times,
            frequency: this.frequency,
            frequencyType: this.frequencyType,
            selectedDays: this.selectedDays,
            intervalDays: this.intervalDays,
            startDate: this.startDate.toISOString(),
            notes: this.notes,
            isActive: this.isActive,
            createdAt: this.createdAt.toISOString(),
        };
    }

    static fromJSON(json) {
        return new Medication({
            ...json,
            startDate: new Date(json.startDate),
        });
    }
}

export default Medication;
