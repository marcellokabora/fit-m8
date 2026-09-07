import type { ActivityFormat, Gender, SexualOrientation, SkillLevel, YesNoFilter } from './types';

export type DiscoverPresetKind = 'default' | 'dating' | 'friends' | 'trainer';

export interface DiscoverPresetContext {
    myGender: Gender | '';
    oppositeGender: Gender | '';
    myOrientation: SexualOrientation;
}

export interface DiscoverPresetValues {
    format: Exclude<ActivityFormat, 'all'> | '';
    level: SkillLevel | '';
    gender: Gender | '';
    orientation: SexualOrientation | '';
    single: YesNoFilter;
    trainer: YesNoFilter;
}

// Single source of truth for what each quick-filter preset sets, shared by the Discover
// header buttons, the Discover filters screen, and onboarding's initial filter setup.
export function getDiscoverPresetValues(
    preset: DiscoverPresetKind,
    { myGender, oppositeGender, myOrientation }: DiscoverPresetContext
): DiscoverPresetValues {
    switch (preset) {
        case 'dating':
            return {
                format: '1v1',
                level: '',
                gender: oppositeGender,
                orientation: myOrientation,
                single: 'yes',
                trainer: ''
            };
        case 'friends':
            return {
                format: '',
                level: '',
                gender: myGender,
                orientation: myOrientation,
                single: '',
                trainer: ''
            };
        case 'trainer':
            return {
                format: '',
                level: 'expert',
                gender: '',
                orientation: '',
                single: '',
                trainer: 'yes'
            };
        default:
            return {
                format: '',
                level: '',
                gender: '',
                orientation: '',
                single: '',
                trainer: ''
            };
    }
}

// True when `values` exactly matches what `preset` would set - used to highlight the
// active quick-filter button.
export function matchesDiscoverPreset(
    preset: DiscoverPresetKind,
    values: DiscoverPresetValues,
    context: DiscoverPresetContext
): boolean {
    const expected = getDiscoverPresetValues(preset, context);
    return (
        values.format === expected.format &&
        values.level === expected.level &&
        values.gender === expected.gender &&
        values.orientation === expected.orientation &&
        values.single === expected.single &&
        values.trainer === expected.trainer
    );
}
