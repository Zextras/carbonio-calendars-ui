/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Dropdown,
	Icon,
	IconButton,
	Padding,
	Row,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { noop } from 'lodash';
import moment from 'moment';
import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { getTimeToDisplayData } from '../../commons/utilities';
import { getLocationUrl } from '../../normalizations/normalize-calendar-events';
import { dismissApptReminder } from '../../store/actions/dismiss-appointment-reminder';
import { snoozeApptReminder } from '../../store/actions/snooze-appointment-reminder';
import { ApptReminderCardProps } from '../../types/appointment-reminder';
import { DateType } from '../../types/event';
import { useGetReminderItems } from './reminder-time-options';

export const AppointmentReminderItem: FC<ApptReminderCardProps> = ({
	reminderItem,
	toggleModal,
	removeReminder,
	setActiveReminder
}): ReactElement => {
	const { start, id, isRecurrent, end, alarmData, location, name, isOrg, key } = reminderItem;
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const [now, setNow] = useState<DateType>(moment().valueOf());

	const locationUrl = useMemo(() => getLocationUrl(location), [location]);

	const dismissReminder = useCallback(() => {
		dispatch(
			dismissApptReminder({
				dismissItems: [{ id, dismissedAt: moment().valueOf() }]
			})
		);
		removeReminder(key);
	}, [dispatch, id, key, removeReminder]);

	const snoozeReminder = useCallback(
		(time, isBefore = true) => {
			const untilForBefore = isRecurrent
				? moment()
						.set({
							hour: moment(start).hour(),
							minute: moment(start).minute()
						})
						.subtract(time, 'minutes')
						.valueOf()
				: moment(start).subtract(time, 'minutes').valueOf();
			dispatch(
				snoozeApptReminder({
					id,
					until: isBefore ? untilForBefore : moment().add(time, 'minutes').valueOf()
				})
			);
			removeReminder(key);
		},
		[isRecurrent, start, dispatch, id, removeReminder, key]
	);

	const reminderItems = useGetReminderItems(snoozeReminder, alarmData);

	const timeToDisplay = useMemo(() => {
		const { color, size, text } = getTimeToDisplayData(reminderItem, now);
		return (
			<Text color={color} size={size}>
				{text}
			</Text>
		);
	}, [now, reminderItem]);

	useEffect(() => {
		const interval = setInterval(() => setNow(moment().valueOf()), 30000);
		return () => clearInterval(interval);
	}, []);

	return (
		<Container
			padding={{ vertical: 'small' }}
			mainAlignment="space-between"
			crossAlignment="center"
			orientation="horizontal"
		>
			<Row
				mainAlignment="space-evenly"
				crossAlignment="center"
				orientation="horizontal"
				width="65%"
			>
				<Row width="20%" mainAlignment="flex-start">
					<Icon icon="PhoneCallOutline" size="large" />
				</Row>
				<Row width="80%" mainAlignment="center" crossAlignment="baseline" orientation="vertical">
					<Row>
						<Text size="large">{name}</Text>
					</Row>
					{locationUrl && (
						<Row>
							<Text>
								<a target="_blank" href={locationUrl} rel="noreferrer">
									{locationUrl}
								</a>
							</Text>
						</Row>
					)}
					<Row padding={{ top: 'extrasmall' }} wrap="nowrap">
						<Text size="large">
							{moment(start).format('HH:mm')} - {moment(end).format('HH:mm')}
						</Text>
						<Padding left="small">{timeToDisplay}</Padding>
					</Row>
				</Row>
			</Row>
			<Row
				width="35%"
				mainAlignment="flex-end"
				crossAlignment="center"
				orientation="horizontal"
				padding={{ horizontal: 'large' }}
			>
				<Row>
					{(moment(start).valueOf() < moment().valueOf() ||
						moment(alarmData[0].alarmInstStart).valueOf() < moment().valueOf()) &&
					isOrg ? (
						<Tooltip placement="top" label={t('label.set_new_time', 'Set new time')}>
							<IconButton
								icon="ClockOutline"
								size="large"
								onClick={(): void => {
									setActiveReminder(reminderItem);
									toggleModal();
								}}
							/>
						</Tooltip>
					) : (
						<Tooltip placement="top" label={t('label.snooze', 'Snooze')}>
							<Dropdown items={reminderItems} placement="bottom-end">
								<IconButton icon="Flip2Outline" size="large" onClick={noop} />
							</Dropdown>
						</Tooltip>
					)}
					<Tooltip placement="top" label={t('label.dismiss', 'Dismiss').toUpperCase()}>
						<IconButton icon="BellOffOutline" size="large" onClick={dismissReminder} />
					</Tooltip>
				</Row>
			</Row>
		</Container>
	);
};
