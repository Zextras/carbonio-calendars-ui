/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Text } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import MoveAppointment from '../view/move/move-appt-view';
import { moveAppointmentRequest } from '../store/actions/move-appointment';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { updateParticipationStatus } from '../store/slices/appointments-slice';
import { deleteAppointmentPermanent } from '../store/actions/delete-appointment-permanent';
import { DeleteEventModal } from '../view/delete/delete-event-modal';
import { applyTag } from '../view/tags/tag-actions';

export const openInDisplayer = (event, context, t) => ({
	id: EventActionsEnum.EXPAND,
	icon: 'ExpandOutline',
	disabled: false,
	label: t('event.action.expand', 'Open in Displayer'),
	keepOpen: true,
	click: (ev) => {
		if (ev) ev.stopPropagation();
		context.replaceHistory(
			`/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
		);
	}
});

export const acceptInvitation = (event, context, t) => ({
	id: EventActionsEnum.ACCEPT,
	icon: 'CheckmarkOutline',
	label: t('event.action.accept', 'Accept'),
	disabled: false,
	click: (ev) => {
		if (ev) ev.stopPropagation();
		context
			.dispatch(
				sendInviteResponse({
					inviteId: event.resource.inviteId,
					updateOrganizer: false,
					action: 'ACCEPT',
					compNum: event.resource.compNum
				})
			)
			.then(() =>
				context.dispatch(updateParticipationStatus({ apptId: event.resource.id, status: 'AC' }))
			);
	}
});

export const declineInvitation = (event, context, t) => ({
	id: EventActionsEnum.DECLINE,
	icon: 'CloseOutline',
	label: t('event.action.decline', 'Decline'),
	disabled: false,
	click: (ev) => {
		if (ev) ev.stopPropagation();
		context
			.dispatch(
				sendInviteResponse({
					inviteId: event.resource.inviteId,
					updateOrganizer: false,
					action: 'DECLINE',
					compNum: event.resource.compNum
				})
			)
			.then(() =>
				context.dispatch(updateParticipationStatus({ apptId: event.resource.id, status: 'DE' }))
			);
	}
});

export const acceptAsTentative = (event, context, t) => ({
	id: EventActionsEnum.TENTATIVE,
	icon: 'QuestionMark',
	label: t('label.tentative', 'Tentative'),
	disabled: false,
	click: (ev) => {
		if (ev) ev.stopPropagation();
		context
			.dispatch(
				sendInviteResponse({
					inviteId: event.resource.inviteId,
					updateOrganizer: false,
					action: 'TENTATIVE',
					compNum: event.resource.compNum
				})
			)
			.then(() =>
				context.dispatch(updateParticipationStatus({ apptId: event.resource.id, status: 'AC' }))
			);
	}
});

export const moveAppointment = (event, context, t) => ({
	id: EventActionsEnum.MOVE,
	icon: 'MoveOutline',
	label:
		event?.resource?.calendar?.id === FOLDERS.TRASH
			? t('label.restore', 'Restore')
			: t('label.move', 'Move'),
	disabled: !event.permission,
	click: (ev) => {
		if (ev) ev.preventDefault();
		const moveAppt = (data) => {
			context.dispatch(moveAppointmentRequest(data)).then((res) => {
				if (res.type.includes('fulfilled')) {
					context.createSnackbar({
						key: event?.resource?.calendar?.id === FOLDERS.TRASH ? 'restore' : 'move',
						replace: true,
						type: 'info',
						hideButton: true,
						label:
							event?.resource?.calendar?.id === FOLDERS.TRASH
								? `${t('message.snackbar.appt_restored', 'Appointment restored successfully to')} ${
										data.destinationCalendarName
								  }`
								: `${t('message.snackbar.appt_moved', 'Appointment moved successfully to')} ${
										data.destinationCalendarName
								  }`,
						autoHideTimeout: 3000
					});
				} else {
					context.createSnackbar({
						key: event?.resource?.calendar?.id === FOLDERS.TRASH ? 'restore' : 'move',
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		};
		const closeModal = context.createModal(
			{
				children: (
					// eslint-disable-next-line react/jsx-filename-extension
					<>
						<MoveAppointment
							event={event}
							onClose={() => closeModal()}
							action={moveAppt}
							createSnackbar={context.createSnackbar}
						/>
					</>
				)
			},
			true
		);
	}
});

export const moveApptToTrash = (event, context, t) => ({
	id: EventActionsEnum.TRASH,
	icon: 'Trash2Outline',
	label: t('label.delete', 'Delete'),
	disabled: !event.permission,
	keepOpen: true,
	click: (ev) => {
		if (ev) ev.stopPropagation();
		const closeModal = context.createModal(
			{
				onClose: () => {
					closeModal();
				},
				children: (
					<>
						<DeleteEventModal
							event={event}
							onClose={() => closeModal()}
							isInstance={context?.isInstance}
						/>
					</>
				)
			},
			true
		);
	}
});

export const deletePermanently = ({ event, context, t }) => ({
	id: 'deletePermanently',
	icon: 'DeletePermanentlyOutline',
	label: t('label.delete_permanently', 'Delete permanently'),
	keepOpen: true,
	click: (ev) => {
		if (ev) ev.preventDefault();
		const closeModal = context.createModal({
			title: t(
				'message.sure_to_delete_appointment_permanently',
				'Are you sure you want to delete this appointment permanently?'
			),
			confirmLabel: t('label.delete_permanently', 'Delete permanently'),
			onConfirm: () => {
				context
					.dispatch(
						deleteAppointmentPermanent({
							inviteId: event.resource.inviteId,
							ridZ: event.resource.ridZ,
							t,
							id: event.resource.id
						})
					)
					.then((res) => {
						closeModal();
						if (res.type.includes('fulfilled')) {
							context.createSnackbar({
								key: `delete-permanently`,
								replace: true,
								type: 'success',
								hideButton: true,
								label: t(
									'message.snackbar.appointment_permanently_deleted_succesfully',
									'Permanent deletion completed successfully'
								),
								autoHideTimeout: 3000
							});
						} else {
							context.createSnackbar({
								key: `delete-permanently`,
								replace: true,
								type: 'error',
								hideButton: true,
								label: t('label.error_try_again', 'Something went wrong, please try again'),
								autoHideTimeout: 3000
							});
						}
					});
			},
			onClose: () => {
				closeModal();
			},
			confirmColor: 'error',
			showCloseIcon: true,
			children: (
				<>
					{event.resource.isRecurrent ? (
						<Text overflow="break-word">
							{t(
								'message.modal.delete.sure_delete_appointment_all_instances_permanently',
								'This will delete all occurences of this appointment and you will not be able to recover it again, continue?'
							)}
						</Text>
					) : (
						<Text overflow="break-word">
							{t(
								'message.modal.delete.sure_delete_appointment_permanently',
								'By deleting permanently this appointment you will not be able to recover it anymore, continue?'
							)}
						</Text>
					)}
				</>
			)
		});
	}
});

export const editAppointment = (event, context, t, isEditable = false) => ({
	id: EventActionsEnum.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit', 'Edit'),
	disabled: isEditable ? !event.resource.iAmOrganizer || !event.haveWriteAccess : true,
	click: (ev) => {
		const query = context?.isInstance ? '?isInstance=TRUE' : '';
		if (ev) ev.stopPropagation();
		context.isFromSearch
			? context.replaceHistory(
					`/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}${query}`
			  )
			: context.replaceHistory(
					`/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}${query}`
			  );
	}
});

export const ActionsRetriever = (event, context, t, includeReplyActions) =>
	// eslint-disable-next-line no-nested-ternary
	!event.resource.iAmOrganizer
		? event.resource.calendar.id === FOLDERS.TRASH
			? [
					deletePermanently({ event, context, t }),
					moveAppointment(event, context, t),
					openInDisplayer(event, context, t),
					applyTag({ t, context, event })
			  ]
			: [
					openInDisplayer(event, context, t),
					...(includeReplyActions
						? [
								acceptInvitation(event, context, t),
								declineInvitation(event, context, t),
								acceptAsTentative(event, context, t)
						  ]
						: []),
					moveAppointment(event, context, t),
					moveApptToTrash(event, context, t),
					editAppointment(event, context, t),
					applyTag({ t, context, event })
			  ]
		: event.resource.calendar.id === FOLDERS.TRASH
		? [
				deletePermanently({ event, context, t }),
				moveAppointment(event, context, t),
				openInDisplayer(event, context, t),
				applyTag({ t, context, event })
		  ]
		: [
				openInDisplayer(event, context, t),
				moveAppointment(event, context, t),
				moveApptToTrash(event, context, t),
				editAppointment(event, context, t, true),
				applyTag({ t, context, event })
		  ];

export const RecurrentActionRetriever = (event, context, t) =>
	event.resource.calendar.id === FOLDERS.TRASH
		? [
				deletePermanently({ event, context, t }),
				moveAppointment(event, context, t),
				openInDisplayer(event, context, t),
				applyTag({ t, context, event })
		  ]
		: [
				{
					id: 'instance',
					icon: 'CalendarOutline',
					label: t('label.instance', 'Instance'),
					click: (ev) => {
						if (ev) ev.preventDefault();
					},
					items: [
						moveApptToTrash(event, { ...context, isInstance: true }, t),
						openInDisplayer(event, context, t)
					]
				},
				{
					id: 'series',
					icon: 'CalendarOutline',
					label: t('label.series', 'Series'),
					click: (ev) => {
						if (ev) ev.preventDefault();
					},
					items: [
						moveApptToTrash(event, { ...context, isInstance: false }, t),
						moveAppointment(event, context, t),
						applyTag({ t, context, event })
					]
				}
		  ];

export const useEventActions = (event, context, t, includeReplyActions = true) =>
	event.resource.isRecurrent
		? RecurrentActionRetriever(event, context, t)
		: ActionsRetriever(event, { ...context, isInstance: true }, t, includeReplyActions);
