/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { isArray, map, forEach } from 'lodash';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const folderAction = createAsyncThunk(
	'calendars/folderAction',
	async ({
		id,
		op,
		zid,
		changes
	}: {
		id: string;
		zid: string;
		op: string;
		changes?: any;
	}): Promise<any> => {
		let result;
		if (isArray(id)) {
			result = await soapFetch('Batch', {
				FolderActionRequest: map(id, (i, idx) => ({
					action: { op, id: i },
					requestId: idx,
					_jsns: 'urn:zimbraMail'
				})),
				_jsns: 'urn:zimbra',
				onerror: 'continue'
			});
		} else {
			const FolderActionRequest: any = [
				{
					action: {
						id,
						op,
						l: changes?.parent, // parent
						recursive: changes?.recursive,
						name: changes?.name,
						color: changes?.color,
						f: `${changes?.excludeFreeBusy ? 'b' : ''}${changes?.checked ? '#' : ''}`,
						zid
					},
					_jsns: 'urn:zimbraMail'
				}
			];
			if (changes?.grant) {
				forEach(changes?.grant, (g) => {
					FolderActionRequest.push({
						action: {
							id,
							op: 'grant',
							grant: g
						},
						_jsns: 'urn:zimbraMail'
					});
				});
			}
			result = await soapFetch('Batch', {
				FolderActionRequest,
				_jsns: 'urn:zimbra'
			});
			return result;
		}
		return result;
	}
);
