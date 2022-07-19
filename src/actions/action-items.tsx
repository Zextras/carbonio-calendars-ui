/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { SyntheticEvent } from 'react';
import { ActionsContext } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import {
	acceptAsTentative,
	acceptInvitation,
	declineInvitation,
	deletePermanently,
	editAppointment,
	moveAppointment,
	moveToTrash,
	openAppointment
} from './action-functions';

export const openInDisplayerItem = (
	event: EventType,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.EXPAND,
	icon: 'ExpandOutline',
	disabled: false,
	label: t('event.action.expand', 'Open in Displayer'),
	keepOpen: true,
	click: (ev: Event): void => openAppointment(ev, event, context)
});

export const acceptInvitationItem = (
	event: EventType,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.ACCEPT,
	icon: 'CheckmarkOutline',
	label: t('event.action.accept', 'Accept'),
	disabled: false,
	click: (ev: Event): void => acceptInvitation(ev, event, context)
});

export const declineInvitationItem = (
	event: EventType,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.DECLINE,
	icon: 'CloseOutline',
	label: t('event.action.decline', 'Decline'),
	disabled: false,
	click: (ev: Event): void => declineInvitation(ev, event, context)
});

export const acceptAsTentativeItem = (
	event: EventType,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.TENTATIVE,
	icon: 'QuestionMark',
	label: t('label.tentative', 'Tentative'),
	disabled: false,
	click: (ev: Event): void => acceptAsTentative(ev, event, context)
});

export const moveAppointmentItem = (
	event: EventType,
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.MOVE,
	icon: 'MoveOutline',
	label:
		event.resource.calendar.id === FOLDERS.TRASH
			? t('label.restore', 'Restore')
			: t('label.move', 'Move'),
	disabled: false,
	click: (ev: Event): void => moveAppointment(ev, invite, context)
});

export const moveApptToTrashItem = (
	invite: Invite,
	event: EventType,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.TRASH,
	icon: 'Trash2Outline',
	label: t('label.delete', 'Delete'),
	disabled: false,
	keepOpen: true,
	click: (ev: Event): void => moveToTrash(ev, event, invite, context)
});

export const deletePermanentlyItem = (
	invite: Invite,
	event: EventType,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: 'deletePermanently',
	icon: 'DeletePermanentlyOutline',
	label: t('label.delete_permanently', 'Delete permanently'),
	keepOpen: true,
	click: (ev: Event): void => deletePermanently(ev, event, context)
});

export const editAppointmentItem = (
	invite: Invite,
	event: EventType,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit', 'Edit'),
	disabled: !invite.isOrganizer || !context?.haveWriteAccess,
	click: (ev: SyntheticEvent<HTMLElement>): void => editAppointment(ev, event, invite, context)
});
