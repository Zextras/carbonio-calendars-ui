/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Select, SelectItem, Text } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { filter, find, map } from 'lodash';
import { selectCalendarsArray } from '../../../store/selectors/calendars';
import { Calendar } from '../../../types/store/calendars';
import LabelFactory, { Square } from './select-label-factory';

type CalendarSelectorProps = {
	calendarId: string;
	onCalendarChange: (calendar: Calendar) => void;
	label?: string;
	excludeTrash?: boolean;
	updateAppTime?: boolean;
	showCalWithWritePerm?: boolean;
	disabled?: boolean;
};

export const CalendarSelector = ({
	calendarId,
	onCalendarChange,
	label,
	excludeTrash = false,
	updateAppTime = false,
	showCalWithWritePerm = true,
	disabled
}: CalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();

	const calendars = useSelector(selectCalendarsArray);
	const calWithWritePerm = useMemo(
		() => (showCalWithWritePerm ? filter(calendars, 'haveWriteAccess') : calendars),
		[calendars, showCalWithWritePerm]
	);

	const requiredCalendars = useMemo(
		() =>
			excludeTrash ? filter(calWithWritePerm, (cal) => cal.id !== FOLDERS.TRASH) : calWithWritePerm,
		[calWithWritePerm, excludeTrash]
	);
	const calendarItems = useMemo(
		() =>
			map(
				requiredCalendars,
				(cal) =>
					({
						label: cal.name,
						value: cal.id,
						color: cal.color.color || 0,
						customComponent: (
							<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
								<Square color={cal.color.color || 'gray6'} />
								<Padding left="small">
									<Text>{cal.name}</Text>
								</Padding>
							</Container>
						)
					} as SelectItem)
			),
		[requiredCalendars]
	);
	const defaultCalendarSelection = useMemo(() => {
		const defaultCalendar = {
			value: requiredCalendars[0].id,
			label: requiredCalendars[0].name,
			color: requiredCalendars[0].color
		};
		return find(calendarItems, ['value', calendarId]) ?? defaultCalendar;
	}, [calendarItems, requiredCalendars, calendarId]);

	const getSelectedCalendar = useCallback(
		(id) => find(calendars, ['id', id]) ?? requiredCalendars[0],
		[calendars, requiredCalendars]
	);

	const onSelectedCalendarChange = useCallback(
		(id) => onCalendarChange(getSelectedCalendar(id)),
		[getSelectedCalendar, onCalendarChange]
	);

	return calendars ? (
		<Select
			label={label || t('label.calendar', 'Calendar')}
			onChange={onSelectedCalendarChange}
			items={calendarItems}
			defaultSelection={defaultCalendarSelection}
			disablePortal
			disabled={updateAppTime || disabled}
			LabelFactory={LabelFactory}
		/>
	) : null;
};
