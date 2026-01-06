// Medication Log Model
export class MedicationLog {
    constructor({
        id = null,
        medicationId = '',
        medicationName = '',
        scheduledTime = new Date(),
        takenTime = null,
        status = 'pending', // 'pending', 'taken', 'missed'
        notes = '',
    }) {
        this.id = id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.medicationId = medicationId;
        this.medicationName = medicationName;
        this.scheduledTime = scheduledTime;
        this.takenTime = takenTime;
        this.status = status;
        this.notes = notes;
        this.createdAt = new Date();
    }

    markAsTaken() {
        this.status = 'taken';
        this.takenTime = new Date();
    }

    markAsMissed() {
        this.status = 'missed';
    }

    toJSON() {
        return {
            id: this.id,
            medicationId: this.medicationId,
            medicationName: this.medicationName,
            scheduledTime: this.scheduledTime.toISOString(),
            takenTime: this.takenTime ? this.takenTime.toISOString() : null,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt.toISOString(),
        };
    }

    static fromJSON(json) {
        return new MedicationLog({
            ...json,
            scheduledTime: new Date(json.scheduledTime),
            takenTime: json.takenTime ? new Date(json.takenTime) : null,
        });
    }
}

export default MedicationLog;
