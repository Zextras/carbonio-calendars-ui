/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useState, useEffect, useMemo } from 'react';
import { filter, find, forEach, includes, isEmpty } from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { getTimeToDisplayData } from '../../commons/utilities';
import { normalizeReminderItem } from '../../normalizations/normalize-reminder';
import { selectAppointmentsArray } from '../../store/selectors/appointments';
import { ReminderItem, Reminders } from '../../types/appointment-reminder';
import { Appointment } from '../../types/store/appointments';
import { showNotification } from '../notifications';
import { ReminderModal } from './reminder-modal';
import sound from '../../assets/notification.mp3';

export const AppointmentReminder = (): ReactElement | null => {
	const [reminders, setReminders] = useState<Reminders>({});
	const appointments = useSelector(selectAppointmentsArray);
	const notificationAudio = useMemo(() => new Audio(sound), []);

	const reminderRange = useMemo(
		() => ({
			start: moment().subtract('7', 'days').valueOf(),
			end: moment().add('15', 'days').valueOf()
		}),
		[]
	);

	const appointmentsToRemind = useMemo(
		() =>
			filter(
				appointments ?? [],
				(appt) =>
					appt.alarm &&
					appt.alarmData?.length &&
					appt?.alarmData?.[0]?.nextAlarm > reminderRange?.start &&
					moment(appt?.alarmData?.[0]?.nextAlarm).isSameOrAfter(moment(reminderRange?.start)) &&
					moment(appt?.alarmData?.[0]?.nextAlarm).isSameOrBefore(moment(reminderRange?.end)) &&
					!includes(appt?.inviteId, ':') &&
					appt?.l !== FOLDERS.TRASH
			) as Appointment[],
		[appointments, reminderRange?.end, reminderRange?.start]
	);

	useEffect(() => {
		const interval = setInterval(() => {
			const remindersToNotify = [] as Array<ReminderItem>;
			forEach(appointmentsToRemind, (appt) => {
				const difference = moment(appt?.alarmData?.[0]?.nextAlarm).diff(moment(), 'seconds', true);
				if (difference <= 0) {
					const reminder = normalizeReminderItem(appt);
					const isAlreadyAdded = find(reminders, {
						start: reminder.start,
						key: reminder.key,
						end: reminder.end
					});
					if (!isAlreadyAdded) {
						remindersToNotify.push(reminder);
						setReminders((rem) => ({
							...rem,
							[reminder.key]: reminder
						}));
					}
				}
			});
			if (remindersToNotify?.length > 0) {
				notificationAudio.play();
				forEach(remindersToNotify, (rem) => {
					const { text } = getTimeToDisplayData(rem, moment());
					showNotification(rem?.name, text);
				});
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [appointmentsToRemind, notificationAudio, reminders]);

	return !isEmpty(reminders) ? (
		<ReminderModal reminders={reminders} setReminders={setReminders} />
	) : null;
};
