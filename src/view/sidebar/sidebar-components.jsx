/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useMemo } from 'react';
import {
	AccordionItem,
	Button,
	Container,
	Dropdown,
	Icon,
	ModalManagerContext,
	Padding,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { useDispatch } from 'react-redux';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter, uniqWith, isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import { getShareInfo } from '../../store/actions/get-share-info';
import { SharesModal } from './shares-modal';
import { useCalendarActions } from '../../hooks/use-calendar-actions';
import { createTag } from '../tags/tag-actions';

export const SharesComponent = ({ item }) => {
	const createModal = useContext(ModalManagerContext);
	const dispatch = useDispatch();
	const onClick = useCallback(
		() =>
			dispatch(getShareInfo()).then((res) => {
				if (res.type.includes('fulfilled')) {
					const calendars = uniqWith(
						filter(res?.payload?.share ?? [], ['view', 'appointment']),
						isEqual
					);
					const closeModal = createModal(
						{
							children: <SharesModal calendars={calendars} onClose={() => closeModal()} />
						},
						true
					);
				}
			}),
		[createModal, dispatch]
	);
	return (
		<Container
			width="fill"
			mainAlignment="center"
			orientation="horizontal"
			style={{ padding: '8px 16px' }}
		>
			<Button type="outlined" label={item.label} color="primary" size="fill" onClick={onClick} />
		</Container>
	);
};

export const FoldersComponent = ({ item }) => {
	const { name, checked, color, recursiveToggleCheck } = item;

	const ddItems = useCalendarActions(item);
	const [t] = useTranslation();

	const icon = useMemo(() => {
		if (item.id === FOLDERS.TRASH) return checked ? 'Trash2' : 'Trash2Outline';
		if (item.owner) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
		return checked ? 'Calendar2' : 'CalendarOutline';
	}, [checked, item.id, item.owner]);

	const sharedStatusIcon = useMemo(() => {
		if (!item.acl?.grant || !item.acl?.grant?.length) {
			return '';
		}

		const tooltipText = t('tooltip.calendar_sharing_status', {
			count: item.acl.grant.length,
			defaultValue_one: 'Shared with 1 person',
			defaultValue: 'Shared with {{count}} people'
		});

		return (
			<Padding right="small">
				<Tooltip placement="right" label={tooltipText}>
					<div>
						<Icon icon="ArrowCircleRight" customColor="#ffb74d" size="large" />
					</div>
				</Tooltip>
			</Padding>
		);
	}, [item, t]);

	return (
		<Dropdown items={ddItems} contextMenu width="100%" display="block">
			<AccordionItem item={item} onClick={recursiveToggleCheck} style={{ height: '40px' }}>
				<Padding right="small">
					<Icon icon={icon} customColor={color?.color} size="large" />
				</Padding>
				<Tooltip label={name} placement="right" maxWidth="100%">
					<Text style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}>{name}</Text>
				</Tooltip>
				{sharedStatusIcon}
			</AccordionItem>
		</Dropdown>
	);
};

export const TagComponent = (item) => {
	const [t] = useTranslation();
	const createModal = useContext(ModalManagerContext);

	return (
		<Dropdown contextMenu display="block" width="fit" items={[createTag({ t, createModal })]}>
			<AccordionItem item={item}>
				<Padding right="small">
					<Icon icon="TagsMoreOutline" size="large" />
				</Padding>
				<Tooltip label={item?.item?.label} placement="right" maxWidth="100%">
					<Text style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}>{item?.item?.label}</Text>
				</Tooltip>
			</AccordionItem>
		</Dropdown>
	);
};
