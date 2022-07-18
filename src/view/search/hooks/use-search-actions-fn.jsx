/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useSelector } from 'react-redux';
import { closeEventFn, editEventFn, moveToBardFn, openEventFn } from '../utils/actions-fn';
import { selectCalendar } from '../../../store/selectors/calendars';

export const useSearchActionsFn = (event, invite) => {
	const history = useHistory();
	const calendar = useSelector((s) => selectCalendar(s, event?.resource?.calendar?.id));
	const { pathname } = useLocation();
	const { apptId, ridZ, action } = useParams();
	const moveToBoard = useCallback(
		(ev, editor) => moveToBardFn(ev, { apptId, ridZ, editor, action, history, pathname }),
		[action, apptId, history, pathname, ridZ]
	);

	const edit = useCallback(
		(ev) => editEventFn(ev, invite, { action, history, pathname, calendar, apptId, ridZ }),
		[action, apptId, calendar, history, invite, pathname, ridZ]
	);

	const open = useCallback(
		(ev) =>
			openEventFn(ev, {
				action,
				history,
				pathname,
				apptId: event?.resource?.id,
				ridZ: event?.resource?.ridZ
			}),
		[action, event?.resource?.id, event?.resource?.ridZ, history, pathname]
	);

	const close = useCallback(
		(ev) => closeEventFn(ev, { action, history, pathname, apptId, ridZ, replaceHistory }),
		[action, apptId, history, pathname, ridZ]
	);

	return {
		edit,
		open,
		close,
		moveToBoard
	};
};
