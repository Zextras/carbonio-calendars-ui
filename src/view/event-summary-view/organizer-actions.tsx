/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Dropdown,
	ModalManagerContext,
	Padding,
	SnackbarManagerContext,
	Row
} from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { map, noop } from 'lodash';
import { useDispatch } from 'react-redux';
import { editAppointment } from '../../actions/action-functions';
import {
	deletePermanentlyItem,
	moveApptToTrashItem,
	openInDisplayerItem
} from '../../actions/action-items';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { applyTag, createAndApplyTag } from '../tags/tag-actions';

const OrganizerActions: FC<{ event: EventType; invite: Invite }> = ({
	event,
	invite
}): ReactElement => {
	const createModal = useContext(ModalManagerContext);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const context = useMemo(
		() => ({
			replaceHistory,
			dispatch,
			createModal,
			createSnackbar,
			tags,
			createAndApplyTag,
			isInstance: true,
			ridZ: event.resource.ridZ
		}),
		[createModal, createSnackbar, dispatch, event.resource.ridZ, tags]
	);

	const otherActions = useMemo(
		() =>
			!invite
				? []
				: [
						event.resource.calendar.id === FOLDERS.TRASH
							? deletePermanentlyItem(invite, event, context, t)
							: moveApptToTrashItem(invite, event, context, t),
						openInDisplayerItem(event, context, t),
						applyTag({ t, context, invite })
				  ],
		[context, event, invite, t]
	);

	const otherActionsOptions = useMemo(
		() =>
			map(otherActions, (action) => ({
				id: action.label,
				icon: action.icon,
				label: action.label,
				key: action.id,
				color: action.color,
				items: action.items,
				customComponent: action.customComponent,
				click: (ev: any): void => {
					ev.stopPropagation();
					action.click();
				}
			})),
		[otherActions]
	);
	return (
		<>
			{event.resource?.calendar?.name === 'Trash' ? (
				<Button
					type="outlined"
					disabled={!event.permission}
					label={t('label.move', 'move')}
					onClick={noop}
				/>
			) : (
				<Button
					disabled={!event.haveWriteAccess}
					type="outlined"
					label={t('label.edit', 'edit')}
					onClick={(ev): void => editAppointment(ev, event, invite, context)}
				/>
			)}

			<Padding left="small">
				<Dropdown disableAutoFocus items={otherActionsOptions} placement="bottom-end">
					<Row>
						<Button
							type="outlined"
							label={t('label.other_actions', 'Other actions')}
							icon="ArrowIosDownwardOutline"
							onClick={noop}
						/>
					</Row>
				</Dropdown>
			</Padding>
		</>
	);
};

export default OrganizerActions;
