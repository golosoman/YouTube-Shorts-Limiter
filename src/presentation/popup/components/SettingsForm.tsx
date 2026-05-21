import { RotateCcw, Save } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import type { UpdateSettingsInputDto } from "@/app/interfaces/use-cases/update-settings/dto";
import type {
  PopupSettingsConstraintsViewModel,
  PopupSettingsValuesViewModel,
} from "@/presentation/popup/viewModel";

interface SettingsFormProps {
  readonly values: PopupSettingsValuesViewModel;
  readonly constraints: PopupSettingsConstraintsViewModel;
  readonly isBusy: boolean;
  readonly onSave: (input: UpdateSettingsInputDto) => Promise<void>;
  readonly onReset: () => Promise<void>;
}

export function SettingsForm({ values, constraints, isBusy, onSave, onReset }: SettingsFormProps) {
  const [formValues, setFormValues] = useState(values);

  useEffect(() => {
    setFormValues(values);
  }, [values]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(): Promise<void> {
    await onSave({
      shortsAllowedMinutes: Number(formValues.shortsAllowedMinutes),
      shortsCooldownMinutes: Number(formValues.shortsCooldownMinutes),
      youtubeAllowedMinutes: Number(formValues.youtubeAllowedMinutes),
      youtubeCooldownMinutes: Number(formValues.youtubeCooldownMinutes),
    });
  }

  return (
    <form
      id="settings-form"
      aria-label="Limiter settings"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <section className="settings-grid">
        <h2>Settings</h2>
        <SettingsFields
          values={formValues}
          constraints={constraints}
          onChange={handleInputChange}
        />
        <SettingsActions isBusy={isBusy} onReset={onReset} />
      </section>
    </form>
  );
}

interface SettingsFieldsProps {
  readonly values: PopupSettingsValuesViewModel;
  readonly constraints: PopupSettingsConstraintsViewModel;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function SettingsFields({ values, constraints, onChange }: SettingsFieldsProps) {
  return (
    <>
      <div className="settings-group">
        <NumberField
          label="Shorts limit"
          name="shortsAllowedMinutes"
          value={values.shortsAllowedMinutes}
          constraints={constraints.shortsAllowedMinutes}
          onChange={onChange}
        />
        <NumberField
          label="Shorts cooldown"
          name="shortsCooldownMinutes"
          value={values.shortsCooldownMinutes}
          constraints={constraints.shortsCooldownMinutes}
          onChange={onChange}
        />
      </div>

      <div className="settings-group">
        <NumberField
          label="YouTube limit"
          name="youtubeAllowedMinutes"
          value={values.youtubeAllowedMinutes}
          constraints={constraints.youtubeAllowedMinutes}
          onChange={onChange}
        />
        <NumberField
          label="YouTube cooldown"
          name="youtubeCooldownMinutes"
          value={values.youtubeCooldownMinutes}
          constraints={constraints.youtubeCooldownMinutes}
          onChange={onChange}
        />
      </div>
    </>
  );
}

interface SettingsActionsProps {
  readonly isBusy: boolean;
  readonly onReset: () => Promise<void>;
}

function SettingsActions({ isBusy, onReset }: SettingsActionsProps) {
  return (
    <div className="actions">
      <button type="submit" disabled={isBusy}>
        <Save aria-hidden="true" size={16} />
        Save settings
      </button>
      <button
        type="button"
        disabled={isBusy}
        onClick={() => {
          void onReset();
        }}
      >
        <RotateCcw aria-hidden="true" size={16} />
        Reset usage
      </button>
    </div>
  );
}

interface NumberFieldProps {
  readonly label: string;
  readonly name: keyof PopupSettingsValuesViewModel;
  readonly value: string;
  readonly constraints: {
    readonly min: string;
    readonly max: string;
    readonly step: string;
  };
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function NumberField({ label, name, value, constraints, onChange }: NumberFieldProps) {
  return (
    <label>
      {label}
      <input
        name={name}
        value={value}
        min={constraints.min}
        max={constraints.max}
        step={constraints.step}
        type="number"
        inputMode="decimal"
        required
        onChange={onChange}
      />
    </label>
  );
}
