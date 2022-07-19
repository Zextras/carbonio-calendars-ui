/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useMemo, useState } from 'react';
import { TFunction } from 'i18next';
import {
	ModalManagerContext,
	SnackbarManagerContext,
	Row,
	Text,
	Padding,
	Icon,
	Checkbox,
	ButtonOld as Button
} from '@zextras/carbonio-design-system';

import { find, includes, reduce } from 'lodash';
import { ZIMBRA_STANDARD_COLORS, useTags, Tag, Tags } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { Invite } from '../../types/store/invite';
import { TagsActionsType } from '../../types/tags';
import CreateUpdateTagModal from './create-update-tag-modal';
import DeleteTagModal from './delete-tag-modal';
import { itemAction } from '../../store/actions/item-action';
import { EventType } from '../../types/event';

export type ReturnType = {
	id: string;
	icon: string;
	label: string;
	click?: (arg: React.SyntheticEvent<EventTarget> | KeyboardEvent) => void;
	items?: Array<{
		customComponent: ReactElement;
		id: string;
		icon: string;
		label: string;
	}>;
};

export type TagType = {
	customComponent?: ReactElement;
	active?: boolean;
	color?: number;
	divider?: boolean;
	id: string;
	label?: string;
	name?: string;
	open?: boolean;
	keepOpen?: boolean;
	CustomComponent?: ReactElement;
};

export type TagsFromStoreType = Record<string, Tag>;

export type ArgumentType = {
	t: TFunction;
	createModal?: unknown;
	createSnackbar?: unknown;
	items?: ReturnType;
	tag?: TagType;
};

export type ContextType = {
	createAndApplyTag: (arg: any) => any;
	createModal: any;
	createSnackbar: unknown;
	dispatch: Dispatch;
	replaceHistory: (arg: any) => void;
	tags: Tags;
};
export const createTag = ({ t, createModal }: ArgumentType): ReturnType => ({
	id: TagsActionsType.NEW,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	click: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{ children: <CreateUpdateTagModal onClose={(): void => closeModal()} /> },
			true
		);
	}
});

export const createAndApplyTag = ({
	t,
	context,
	event
}: {
	t: TFunction;
	context: ContextType;
	event: EventType;
}): ReturnType => ({
	id: TagsActionsType.NEW,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	click: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = context.createModal(
			{ children: <CreateUpdateTagModal onClose={(): void => closeModal()} event={event} /> },
			true
		);
	}
});
export const editTag = ({ t, createModal, tag }: ArgumentType): ReturnType => ({
	id: TagsActionsType.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit_tag', 'Edit Tag'),
	click: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				children: <CreateUpdateTagModal onClose={(): void => closeModal()} tag={tag} editMode />
			},
			true
		);
	}
});

export const deleteTag = ({ t, createModal, tag }: ArgumentType): ReturnType => ({
	id: TagsActionsType.DELETE,
	icon: 'Untag',
	label: t('label.delete_tag', 'Delete Tag'),
	click: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				children: <DeleteTagModal onClose={(): void => closeModal()} tag={tag} />
			},
			true
		);
	}
});

export const TagsDropdownItem = ({ tag, invite }: { tag: Tag; invite: Invite }): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useContext(SnackbarManagerContext);

	const [checked, setChecked] = useState(includes(invite.tags, tag.id));
	const [isHovering, setIsHovering] = useState(false);
	const toggleCheck = useCallback(
		(value) => {
			setChecked((c) => !c);

			itemAction({
				operation: value ? '!tag' : 'tag',
				inviteId: invite.id,
				tagName: tag.name
			})
				.then((res: any) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						hideButton: true,
						type: 'info',
						label: value
							? t('snackbar.tag_removed', { tag: tag.name, defaultValue: '"{{tag}}" tag removed' })
							: t('snackbar.tag_applied', {
									tag: tag.name,
									defaultValue: '"{{tag}}" tag applied'
							  }),
						autoHideTimeout: 3000
					});
				})
				.catch((error) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				});
		},
		[invite?.id, createSnackbar, t, tag.name]
	);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const tagColor = useMemo(() => ZIMBRA_STANDARD_COLORS[tag.color || 0].hex, [tag.color]);
	const tagIcon = useMemo(() => (checked ? 'Tag' : 'TagOutline'), [checked]);
	const tagIconOnHovered = useMemo(() => (checked ? 'Untag' : 'Tag'), [checked]);

	return (
		<Row
			takeAvailableSpace
			mainAlignment="flex-start"
			onClick={(): void => toggleCheck(checked)}
			onMouseEnter={(): void => setIsHovering(true)}
			onMouseLeave={(): void => setIsHovering(false)}
		>
			<Padding right="small">
				<Checkbox value={checked} />
			</Padding>
			<Row takeAvailableSpace mainAlignment="space-between">
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text>{tag.name}</Text>
				</Row>
				<Row mainAlignment="flex-end">
					<Icon icon={isHovering ? tagIconOnHovered : tagIcon} color={tagColor} />
				</Row>
			</Row>
		</Row>
	);
};

export const applyTag = ({
	t,
	context,
	invite
}: {
	t: TFunction;
	invite: Invite;
	context: ContextType;
}): { id: string; items: TagType[]; customComponent: ReactElement } => {
	const tagItem = reduce(
		context.tags,
		(
			acc: Array<{
				id: string;
				label?: string;
				icon?: string;
				keepOpen: boolean;
				customComponent: ReactElement;
			}>,
			v
		) => {
			const item = {
				id: v.id,
				label: v.name,
				icon: 'TagOutline',
				keepOpen: true,
				customComponent: <TagsDropdownItem tag={v} invite={invite} />
			};
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			acc.push(item);
			return acc;
		},
		[]
	);

	tagItem.push({
		id: 'new_tag',
		keepOpen: true,
		customComponent: (
			<Button
				label={t('label.new_tag', 'New Tag')}
				type="outlined"
				size="fill"
				isSmall
				onClick={(): void => context.createAndApplyTag({ t, context, invite }).click()}
			/>
		)
	});
	return {
		id: TagsActionsType.Apply,
		items: tagItem,
		customComponent: (
			<Row takeAvailableSpace mainAlignment="flex-start">
				<Padding right="small">
					<Icon icon="TagsMoreOutline" />
				</Padding>
				<Row takeAvailableSpace mainAlignment="space-between">
					<Padding right="small">
						<Text>{t('label.tags', 'Tags')}</Text>
					</Padding>
				</Row>
			</Row>
		)
	};
};

export const useGetTagsActions = ({ tag, t }: ArgumentType): Array<ReturnType> => {
	const createModal = useContext(ModalManagerContext);
	const createSnackbar = useContext(SnackbarManagerContext);
	return useMemo(
		() => [
			createTag({ t, createModal }),
			editTag({ t, createModal, tag }),
			deleteTag({ t, tag, createSnackbar, createModal })
		],
		[createModal, createSnackbar, t, tag]
	);
};

export const useTagsArrayFromStore = (): Array<TagType> => {
	const tagsFromStore = useTags();
	return useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc: Array<TagType>, v: any) => {
					acc.push(v);
					return acc;
				},
				[]
			),
		[tagsFromStore]
	);
};

export const useTagExist = (tags: Array<TagType>): boolean => {
	const tagsArrayFromStore = useTagsArrayFromStore();
	return useMemo(
		() =>
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			reduce(
				tags,
				(acc: boolean, v: Tag) => {
					let tmp = false;
					if (find(tagsArrayFromStore, { id: v?.id })) tmp = true;
					return tmp;
				},
				false
			),
		[tags, tagsArrayFromStore]
	);
};
