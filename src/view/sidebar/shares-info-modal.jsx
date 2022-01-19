/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Icon, Row, Text } from '@zextras/carbonio-design-system';
import { ModalHeader } from '../../commons/modal-header';

export const ShareInfoRow = ({ icon, label, text }) => (
	<Row width="fill" mainAlignment="flex-start" padding={{ all: 'small' }}>
		<Row padding={{ right: 'small' }}>
			<Icon icon={icon} />
			<Row padding={{ right: 'small', left: 'small' }}>
				<Text weight="bold">{`${label}: `}</Text>
			</Row>
			<Row takeAvailableSpace>
				<Text>{text}</Text>
			</Row>
		</Row>
	</Row>
);

export const SharesInfoModal = ({ onClose, folder }) => {
	const [t] = useTranslation();

	const text = (/r/.test(folder.perm || '') ? `${t('read', 'Read')}` : '')
		.concat(/w/.test(folder.perm || '') ? `, ${t('write', 'Write')}` : '')
		.concat(/i/.test(folder.perm || '') ? `, ${t('insert', 'Insert')}` : '')
		.concat(/d/.test(folder.perm || '') ? `, ${t('label.delete', 'Delete')}` : '')
		.concat(/a/.test(folder.perm || '') ? `, ${t('administer', 'Administer')}` : '')
		.concat(/p/.test(folder.perm || '') ? `, ${t('label.private', 'Private')}` : '')
		.concat(/f/.test(folder.perm || '') ? `, ${t('freebusy', 'FreeBusy')}` : '')
		.concat(/c/.test(folder.perm || '') ? `, ${t('label.create', 'Create')}` : '')
		.concat(/x/.test(folder.perm || '') ? `, ${t('workflow', 'WorkFlow')}` : '');
	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={`${t('folder.share_info', 'Share Info')} `} onClose={onClose} />
			<ShareInfoRow
				icon="InfoOutline"
				label={`${t('shared_items', 'Shared items')}`}
				text={folder.name}
			/>
			<ShareInfoRow icon="PersonOutline" label={`${t('owner', 'Owner')}`} text={folder.owner} />
			<ShareInfoRow
				icon="CalendarModOutline"
				label={`${t('type', 'Type')}`}
				text={t('shared_folders', 'Shared Calendars')}
			/>
			<ShareInfoRow
				icon="UnlockOutline"
				label={`${t('allowed_actions', 'Allowed actions')}`}
				text={text}
			/>
			<ShareInfoRow
				icon="AppointmentOutline"
				label={`${t('appointments', 'Appointments')}`}
				text={folder.n}
			/>
		</Container>
	);
};
