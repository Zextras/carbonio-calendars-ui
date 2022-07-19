/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense, lazy, useEffect, useMemo, ReactElement } from 'react';
import { ButtonOld as Button, Container } from '@zextras/carbonio-design-system';
import { isEmpty, noop } from 'lodash';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import EditorPanelWrapper from '../editor/editor-panel-wrapper';
import CalendarStyle from './calendar-style';
import { selectCalendars } from '../../store/selectors/calendars';
import { selectApptStatus } from '../../store/selectors/appointments';
import EventPanelView from '../event-panel-view/event-panel-view';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { searchAppointments } from '../../store/actions/search-appointments';

const CalendarComponent = lazy(
	() => import(/* webpackChunkName: "calendar-component" */ './calendar-component')
);

export default function CalendarView(): ReactElement {
	const calendars = useSelector(selectCalendars);
	const primaryCalendar = useMemo(() => calendars?.[10] ?? {}, [calendars]);
	const status = useSelector(selectApptStatus);
	const dispatch = useDispatch();
	const { path } = useRouteMatch();

	useEffect(() => {
		if (!isEmpty(calendars) && status === 'init') {
			const now = moment();
			const start = now.startOf('isoWeek').valueOf();
			const end = now.endOf('isoWeek').valueOf();
			dispatch(searchAppointments({ spanEnd: end, spanStart: start }));
		}
	}, [dispatch, status, calendars]);

	return (
		<Container
			background="gray6"
			padding={{ all: 'large' }}
			style={{ overflowY: 'auto', position: 'relative' }}
		>
			<CalendarStyle primaryCalendar={primaryCalendar} />
			<Suspense
				fallback={
					<Container height="50%" mainAlignment="center" crossAlignment="center">
						<Button loading disabled label="" type="ghost" onClick={noop} />
					</Container>
				}
			>
				<CalendarComponent />
			</Suspense>
			<Switch>
				<Route path={`${path}/:calendarId/:action(${EventActionsEnum.EXPAND})/:apptId/:ridZ?`}>
					<EventPanelView />
				</Route>
				<Route path={`${path}/:calendarId/:action(${EventActionsEnum.EDIT})/:apptId/:ridZ?`}>
					<EditorPanelWrapper />
				</Route>
			</Switch>
		</Container>
	);
}
