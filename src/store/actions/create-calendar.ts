/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { extractCalendars } from '../../utils/store/calendars';

export const createCalendar = createAsyncThunk(
	'calendars/create',
	async ({ name, parent, color, excludeFreeBusy }: any, { requestId }) => {
		const { folder } = (await soapFetch('CreateFolder', {
			_jsns: 'urn:zimbraMail',
			folder: {
				color,
				f: excludeFreeBusy ? 'b' : '',
				l: parent,
				name,
				view: 'appointment'
			}
		})) as { folder: any };
		return [extractCalendars(folder), requestId];
	}
);
