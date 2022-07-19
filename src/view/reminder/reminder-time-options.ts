/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DropdownItem } from '@zextras/carbonio-design-system';
import { filter } from 'lodash';
import moment from 'moment';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlarmData } from '../../types/store/invite';

// interface DropdownItem {
// 	type?: 'divider';
// 	id: string;
// 	label: string;
// 	icon?: string;
// 	click?: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
// 	selected?: boolean;
// 	customComponent?: React.ReactNode;
// 	disabled?: boolean;
// 	items?: Array<DropdownItem>;
// 	keepOpen?: boolean;
// }
//
// type ReturnType = Array<{
// 	id: string;
// 	label?: string;
// 	click?: () => void;
// 	value: number;
// 	type?: 'divider';
// }>;
type Option = {
	id: string;
	label: string;
	value: number;
	beforeEvent?: boolean;
};
export const useGetReminderItems = (
	setSnooze: (arg1: number, arg2?: boolean) => void,
	alarmData: AlarmData
): DropdownItem[] => {
	const [t] = useTranslation();

	const diff = useMemo(
		() => moment(alarmData?.[0]?.alarmInstStart).diff(moment(), 'seconds'),
		[alarmData]
	);
	const beforeList = useMemo(
		() =>
			[
				{
					id: t('reminder.at_time_of_event', 'At the time of the event'),
					label: t('reminder.at_time_of_event', 'At the time of the event'),
					value: 0
				},
				{
					id: t('reminder.minute_before', {
						count: 1,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					label: t('reminder.minute_before', {
						count: 1,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					value: 60
				},
				{
					id: t('reminder.minute_before', {
						count: 5,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					label: t('reminder.minute_before', {
						count: 5,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					value: 5 * 60
				},
				{
					id: t('reminder.minute_before', {
						count: 10,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					label: t('reminder.minute_before', {
						count: 10,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					value: 10 * 60
				},
				{
					id: t('reminder.minute_before', {
						count: 15,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					label: t('reminder.minute_before', {
						count: 15,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					value: 15 * 60
				},
				{
					id: t('reminder.minute_before', {
						count: 30,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					label: t('reminder.minute_before', {
						count: 30,
						defaultValue: '{{count}} minute before',
						defaultValue_plural: '{{count}} minutes before'
					}),
					value: 15 * 60
				},
				{
					id: t('reminder.hour_before', {
						count: 1,
						defaultValue: '{{count}} hour before',
						defaultValue_plural: '{{count}} hours before'
					}),
					label: t('reminder.hour_before', {
						count: 1,
						defaultValue: '{{count}} hour before',
						defaultValue_plural: '{{count}} hours before'
					}),
					value: 60 * 60
				}
			] as Option[],
		[t]
	);

	const afterList = useMemo(
		() =>
			[
				{
					id: 'reminder_after_1',
					label: t('reminder.minutes', {
						count: 1,
						defaultValue: '{{count}} minute ',
						defaultValue_plural: '{{count}} minutes'
					}),
					beforeEvent: false,
					value: 60
				},
				{
					id: 'reminder_after_5',
					label: t('reminder.minutes', {
						count: 5,
						defaultValue: '{{count}} minute',
						defaultValue_plural: '{{count}} minutes'
					}),
					beforeEvent: false,
					value: 5 * 60
				},
				{
					id: 'reminder_after_10',
					label: t('reminder.minutes', {
						count: 10,
						defaultValue: '{{count}} minute',
						defaultValue_plural: '{{count}} minutes'
					}),
					beforeEvent: false,
					value: 10 * 60
				},
				{
					id: 'reminder_after_15',
					label: t('reminder.minutes', {
						count: 15,
						defaultValue: '{{count}} minute',
						defaultValue_plural: '{{count}} minutes'
					}),
					beforeEvent: false,
					value: 15 * 60
				},
				{
					id: 'reminder_after_30',
					label: t('reminder.minutes', {
						count: 30,
						defaultValue: '{{count}} minute',
						defaultValue_plural: '{{count}} minutes '
					}),
					beforeEvent: false,
					value: 30 * 60
				},
				{
					id: 'reminder_after_60',
					label: t('reminder.hours', {
						count: 1,
						defaultValue: '{{count}} hour',
						defaultValue_plural: '{{count}} hours'
					}),
					beforeEvent: false,
					value: 60 * 60
				}
			] as Option[],
		[t]
	);

	return useMemo(() => {
		const createDropDownItem = (option: Option): DropdownItem => ({
			id: option.id,
			label: option.label,
			click: (): void => setSnooze(option.value / 60, option.beforeEvent ?? true)
		});

		return [
			...filter(beforeList, (item) => item.value <= diff).map((option) =>
				createDropDownItem(option)
			),
			{
				id: 'reminder_divider',
				label: '',
				type: 'divider'
			},
			...afterList.map((option) => createDropDownItem(option))
		];
	}, [afterList, beforeList, diff, setSnooze]);
};
