/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep, filter, forEach } from 'lodash';
import { ZIMBRA_STANDARD_COLORS } from '../../commons/zimbra-standard-colors';
import { CalendarSlice } from '../../types/store/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function folderActionFullFilled(state: CalendarSlice, { meta }: any): any {
	const { op } = meta.arg;

	switch (op) {
		case 'move':
			state.status = 'succeeded';
			break;
		case 'trash':
			state.status = 'succeeded';
			break;
		case 'update':
			state.status = 'succeeded';
			break;
		case 'delete':
			state.status = 'succeeded';
			break;
		case 'empty':
			state.status = 'succeeded';
			break;
		case 'check':
			state.status = 'succeeded';
			break;
		case '!check':
			state.status = 'succeeded';
			break;
		default:
			console.error('Operation not handled', op);
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function folderActionPending(state: CalendarSlice, { meta }: any): any {
	const { id, op, changes, zid } = meta.arg;
	// eslint-disable-next-line no-param-reassign
	meta.arg.prevState = cloneDeep(state.calendars);
	switch (op) {
		case 'move':
			state.calendars[id].parent = changes.parent;
			state.status = 'updating';
			break;
		case 'trash':
			state.calendars[id].parent = '3';
			state.status = 'updating';
			break;
		case 'update':
			state.calendars[id] = {
				...state.calendars[id],
				parent: changes.parent,
				checked: true,
				color: ZIMBRA_STANDARD_COLORS[Number(meta.arg.changes.color)]
			};
			state.status = 'updating';
			break;
		case 'delete':
			delete state.calendars[id];
			state.status = 'updating';
			break;
		case '!check':
		case 'check':
			break;
		case '!grant': {
			const newAcl = filter(state.calendars[id].acl.grant, (rights) => rights.zid !== zid);
			const updatedFolder = {
				...state.calendars[id],
				acl: newAcl.length > 0 ? { grant: newAcl } : {}
			};
			state.calendars[updatedFolder.id].acl = newAcl.length > 0 ? { grant: newAcl } : {};
			state.status = 'updating';
			break;
		}

		case 'empty':
			forEach(state.calendars, (value, key) => {
				if (value.parent === '3') delete state.calendars[key];
			});
			break;
		default:
			console.error('Operation not handled', op, meta.arg);
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function folderActionRejected(state: CalendarSlice, { meta }: any): any {
	state.calendars = meta.arg.prevState;
	state.status = 'rejected';
}
// todo: check if calendar actions works properly
